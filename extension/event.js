/**
 * Netsips Background Service Worker (Manifest V3)
 * Offline-first, event-driven background controller.
 */

try {
  if (typeof importScripts === 'function') {
    importScripts('db.js');
  }
} catch (e) {
  console.warn('LocalDB import in background worker:', e);
}

// Ensure default popup is always the primary bookmarking interface
function syncActionPopup() {
  var actionApi = chrome.action || chrome.browserAction;
  if (actionApi && actionApi.setPopup) {
    actionApi.setPopup({
      popup: "popup_main.html"
    });
  }
}

syncActionPopup();

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

// External message handling
chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
  if (sender && sender.url && sender.url.indexOf('netsips.in/whatsapp.html') !== -1) {
    if (typeof LocalDB !== 'undefined' && LocalDB.settings) {
      LocalDB.settings.set('phone', request.phone);
      LocalDB.settings.set('isWhatsApp', true);
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
  chrome.storage.local.get(['isHome'], function(result) {
    if (tab.title === 'New Tab' && result && result.isHome) {
      chrome.tabs.update(tab.id, { url: chrome.runtime.getURL('new.html') });
    }
  });
});

chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.get(['isHome'], function(result) {
    if (result && result.isHome) {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs && tabs[0] && tabs[0].url === 'chrome://newtab/') {
          chrome.tabs.update(tabs[0].id, { url: chrome.runtime.getURL('new.html') });
        }
      });
    }
  });
});