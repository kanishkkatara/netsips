var image = '';
var website_url = '';
var main_site = '';

// The favicon and the title of the active tab
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) { 
  if (tabs && tabs[0]) {
    var tab = tabs[0];
    var title = tab.title || ''; 
    var url = tab.url || '';
    website_url = url;
    var modalContent = document.getElementById("modal-content");
    if (modalContent) {
      modalContent.innerHTML = "<p id='website-title'>" + (title || url) + "</p>";
    }
  }
});

var recent = document.getElementById('recent-container');

// Firebase Configuration
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
  if (typeof firebase !== 'undefined' && firebase.apps && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
} catch(e) {
  console.warn("Firebase init:", e);
}

var db = null;
try {
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    db = firebase.firestore();
  }
} catch(e) {
  console.warn("Firestore init:", e);
}

function title_trimmer(website_title) {
  if (!website_title) return '';
  if (website_title.length >= 60) {
    return website_title.substring(0, 60) + '...';
  }
  return website_title;
}

// Render recents from local storage
chrome.storage.local.get({ list: [] }, function(data) {
  if (!recent) return;
  var icon_link = "https://s2.googleusercontent.com/s2/favicons?domain_url=";
  var items = data.list || [];
  recent.innerHTML = '';
  for (let i = items.length - 1; i >= 0; i--) {
    if (i > items.length - 4) {
      let url = items[i]["URL"] || '';
      let title = title_trimmer(items[i]["Title"] || '');  
      let fav = items[i]["Icon"] || (icon_link + encodeURIComponent(url));
      let tr = document.createElement('tr');
      tr.innerHTML = `<td style='border-bottom: 1px solid #dddddd; margin: 0;'><img style="height:15px; width:15px;" src="${fav}"/></td><td class='recent' style='border-bottom: 1px solid #dddddd;'><a href="${url}" target="_blank">${title}</a></td>`;
      recent.appendChild(tr);
    }
  }

  // Bind clicks for recent links
  var recentLinks = document.getElementsByClassName('recent');
  for (let x = 0; x < recentLinks.length; x++) {
    let anchor = recentLinks[x].querySelector('a');
    if (anchor) {
      recentLinks[x].addEventListener('click', function(e) {
        e.preventDefault();
        chrome.tabs.create({ url: anchor.href });
      });
    }
  }
});

const linkopener = (link) => {
  if (typeof link === 'string') {
    chrome.tabs.create({ url: link });
  }
};

var dropMenu = document.getElementById('drop-menu');
if (dropMenu) {
  dropMenu.addEventListener('click', checkdropy);
}

function checkdropy() {
  var rec = document.getElementById('recent-container');
  var upIcon = document.getElementById('up-icon');
  if (!rec) return;

  if (rec.style.display === 'block') {
    rec.style.display = 'none';
    if (upIcon) upIcon.src = 'images/extension_images/arrow-down.svg';
    chrome.storage.local.set({ recentisOpen: false });
  } else {
    rec.style.display = 'block';
    if (upIcon) upIcon.src = 'images/extension_images/arrow-up.svg';
    chrome.storage.local.set({ recentisOpen: true });
  }
}

window.addEventListener('load', function() {
  chrome.storage.local.get(['recentisOpen'], function(result) {
    var rec = document.getElementById('recent-container');
    var upIcon = document.getElementById('up-icon');
    if (result && result.recentisOpen) {
      if (rec) rec.style.display = 'block';
      if (upIcon) upIcon.src = 'images/extension_images/arrow-up.svg';
    } else {
      if (rec) rec.style.display = 'none';
      if (upIcon) upIcon.src = 'images/extension_images/arrow-down.svg';
    }
  });
});

// Delivery from content.js
function onPageDetailsReceived(pageDetails) {
  if (!pageDetails) return;
  var wordCountEl = document.getElementById('word_count');
  if (wordCountEl && pageDetails.word_count) {
    wordCountEl.innerText = " " + pageDetails.word_count;
    if (pageDetails.word_count > 1000) {
      wordCountEl.style.color = "red";
    }
  }

  if (pageDetails.url) {
    website_url = pageDetails.url;
  }
  
  var estTimeEl = document.getElementById('est_time');
  if (estTimeEl) {
    var estTime = pageDetails.estimated_time || 1;
    estTimeEl.innerText = "(around " + estTime + (estTime == 1 ? " minute)" : " minutes)");
  }

  image = pageDetails.img_url || '';
  var titleEl = document.getElementById('website-title');
  if (titleEl && image) {
    titleEl.style.backgroundImage = `linear-gradient(45deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.4) ), url(${image})`; 
  }

  main_site = pageDetails.main_site || '';
}

// Add Bookmark submit handler
const addBookmark = (e) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  var fav_icon = "https://s2.googleusercontent.com/s2/favicons?domain_url=" + encodeURIComponent(website_url || 'https://google.com');
  var titleEl = document.getElementById('website-title');
  var website_title = titleEl ? titleEl.innerText : '';
  var tagsEl = document.getElementById("popup_tags");
  var tags = tagsEl ? tagsEl.value : '';

  var web_details = {
    URL: website_url,
    imageUrl: image,
    Title: website_title,
    Date: Date.now(),
    Icon: fav_icon,
    Tags: tags,
    mainSite: main_site
  };

  var statusDisplay = document.getElementById('save');
  if (statusDisplay) {
    statusDisplay.value = "Saving...";
  }

  chrome.storage.local.get({ list: [], key: '', isNew: false }, function(data) {
    var list = data.list || [];
    list.push(web_details);

    var updates = { list: list };
    if (data.isNew) {
      updates.isNew = false;
    }

    chrome.storage.local.set(updates, function() {
      if (db && data.key && data.key !== 'local_user') {
        try {
          db.collection(data.key).add({
            status: 100,
            tags: tags,
            title: website_title,
            imageUrl: image,
            dateAdded: (firebase.firestore && firebase.firestore.Timestamp) ? firebase.firestore.Timestamp.now() : new Date(),
            articleURL: website_url,
            mainSite: main_site
          }).catch(function(error) {
            console.warn("Firestore sync warning:", error);
          });
        } catch (err) {
          console.warn("Firestore call error:", err);
        }
      }

      if (statusDisplay) {
        statusDisplay.value = "Saved!";
      }
      setTimeout(function() { 
        window.close(); 
      }, 500);
    });
  });
};

// When popup HTML has loaded
window.addEventListener('load', function() {
  var addBookmarkForm = document.getElementById('addbookmark');
  if (addBookmarkForm) {
    addBookmarkForm.addEventListener('submit', addBookmark);
  }

  // Inject content script to fetch active tab details
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

  chrome.runtime.onMessage.addListener(function(message) {
    onPageDetailsReceived(message);
  });
});

// Settings page open on click
var settingsIcon = document.getElementById('settings-icon');
if (settingsIcon) {
  settingsIcon.addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  });
}
