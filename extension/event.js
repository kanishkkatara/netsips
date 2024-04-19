try {
  if (typeof importScripts === 'function') {
    importScripts(
      'firebase/firebase-app.js',
      'firebase/firebase-database.js'
    );
  }
} catch (e) {
  console.warn('Firebase scripts import in background worker:', e);
}

var firebaseConfig = {
  apiKey: "AIzaSyBDaQL21llq2-5ftbSh0WvC243M6p_ZsgY",
  authDomain: "netsips-1586535958950.firebaseapp.com",
  databaseURL: "https://netsips-1586535958950.firebaseio.com",
  projectId: "netsips-1586535958950",
  storageBucket: "netsips-1586535958950.appspot.com",
  messagingSenderId: "617103322863",
  appId: "1:617103322863:web:4fbe39c3ad6acf34f3f51a",
  measurementId: "G-E4SH3K42ZY"
};

try {
  if (typeof firebase !== 'undefined' && firebase.initializeApp && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
} catch (e) {
  console.warn('Firebase init warning in background worker:', e);
}

// Function to inject content script and listen for details
function getPageDetails(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs && tabs[0]) {
      var tabId = tabs[0].id;
      var tabUrl = tabs[0].url || '';
      var isRestricted = tabUrl.startsWith('chrome://') || 
                         tabUrl.startsWith('chrome-extension://') || 
                         tabUrl.startsWith('edge://') || 
                         tabUrl.startsWith('about:') ||
                         tabUrl.indexOf('chrome.google.com/webstore') !== -1 ||
                         tabUrl.indexOf('chromewebstore.google.com') !== -1;
      if (!isRestricted) {
        if (chrome.scripting && chrome.scripting.executeScript) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          }).catch(function(err) {
            console.warn('Scripting inject catch:', err);
          });
        } else if (chrome.tabs.executeScript) {
          chrome.tabs.executeScript(tabId, { file: 'content.js' });
        }
      }
    }
  });

  chrome.runtime.onMessage.addListener(function (message) {
    if (typeof callback === 'function') {
      callback(message);
    }
  });
}

// Set initial popup based on signed-in state
function syncActionPopup(isSigned) {
  var actionApi = chrome.action || chrome.browserAction;
  if (actionApi && actionApi.setPopup) {
    actionApi.setPopup({
      popup: isSigned ? "popup_main.html" : "popup.html"
    });
  }
}

chrome.storage.local.get(['isSigned'], function (result) {
  syncActionPopup(result && result.isSigned);
});

// Reactively update popup when user signs in or signs out
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'local' && changes.isSigned) {
    syncActionPopup(changes.isSigned.newValue);
  }
});

// External message handling
chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
  if (sender && sender.url && sender.url.indexOf('netsips.in/whatsapp.html') !== -1) {
    if (typeof firebase !== 'undefined' && firebase.database) {
      let db_rtd = firebase.database();
      let rtd = db_rtd.ref();
      chrome.storage.local.get(['key'], function(result) {
        if (result && result.key) {
          rtd.child(result.key).update({ 'phone': request.phone });
        }
      });
    }
    chrome.storage.local.set({ isWhatsApp: true, phone: request.phone });
  }
});

// Open dashboard upon extension install
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  }
});

// Custom new tab listener
chrome.tabs.onCreated.addListener(function(tab) {
  chrome.storage.local.get(['isHome', 'isSigned'], function(result) {
    if (tab.title === 'New Tab' && result && result.isHome && result.isSigned) {
      chrome.tabs.update(tab.id, { url: chrome.runtime.getURL('new.html') });
    }
  });
});

chrome.storage.local.get(['isHome', 'isSigned'], function(result) {
  chrome.runtime.onStartup.addListener(function() {
    if (result && result.isHome && result.isSigned) {
      chrome.tabs.update({ url: chrome.runtime.getURL('new.html') });
    }
  });
});