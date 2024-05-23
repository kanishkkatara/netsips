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

function title_trimmer(website_title) {
  if (!website_title) return '';
  if (website_title.length >= 60) {
    return website_title.substring(0, 60) + '...';
  }
  return website_title;
}

// Render recents from Local-First Database
function renderRecents() {
  if (!recent) return;
  var icon_link = "https://s2.googleusercontent.com/s2/favicons?domain_url=";

  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    LocalDB.bookmarks.getAll({ status: 100, limit: 3 }).then(function(items) {
      recent.innerHTML = '';
      items.forEach(function(item) {
        let url = item.articleURL || item.URL || '';
        let title = title_trimmer(item.title || item.Title || '');  
        let fav = item.Icon || (icon_link + encodeURIComponent(url));
        let tr = document.createElement('tr');
        tr.innerHTML = `<td style='border-bottom: 1px solid #dddddd; margin: 0;'><img style="height:15px; width:15px;" src="${fav}"/></td><td class='recent' style='border-bottom: 1px solid #dddddd;'><a href="${url}" target="_blank">${title}</a></td>`;
        recent.appendChild(tr);
      });

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
  } else {
    chrome.storage.local.get({ list: [] }, function(data) {
      var items = data.list || [];
      recent.innerHTML = '';
      for (let i = items.length - 1; i >= 0 && i > items.length - 4; i--) {
        let url = items[i]["URL"] || '';
        let title = title_trimmer(items[i]["Title"] || '');  
        let fav = items[i]["Icon"] || (icon_link + encodeURIComponent(url));
        let tr = document.createElement('tr');
        tr.innerHTML = `<td style='border-bottom: 1px solid #dddddd; margin: 0;'><img style="height:15px; width:15px;" src="${fav}"/></td><td class='recent' style='border-bottom: 1px solid #dddddd;'><a href="${url}" target="_blank">${title}</a></td>`;
        recent.appendChild(tr);
      }
    });
  }
}

renderRecents();

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

// Add Bookmark submit handler (Local-First)
const addBookmark = (e) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  var fav_icon = "https://s2.googleusercontent.com/s2/favicons?domain_url=" + encodeURIComponent(website_url || 'https://google.com');
  var titleEl = document.getElementById('website-title');
  var website_title = titleEl ? titleEl.innerText : '';
  var tagsEl = document.getElementById("popup_tags");
  var tags = tagsEl ? tagsEl.value : '';

  var bookmarkDoc = {
    URL: website_url,
    articleURL: website_url,
    imageUrl: image,
    Title: website_title,
    title: website_title,
    Date: Date.now(),
    dateAdded: Date.now(),
    Icon: fav_icon,
    Tags: tags,
    tags: tags,
    mainSite: main_site,
    status: 100
  };

  var statusDisplay = document.getElementById('save');
  if (statusDisplay) {
    statusDisplay.value = "Saving...";
  }

  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    LocalDB.bookmarks.add(bookmarkDoc).then(function() {
      if (statusDisplay) {
        statusDisplay.value = "Saved!";
      }
      setTimeout(function() { 
        window.close(); 
      }, 500);
    }).catch(function(err) {
      console.warn("LocalDB save fallback:", err);
      chrome.storage.local.get({ list: [] }, function(data) {
        var list = data.list || [];
        list.push(bookmarkDoc);
        chrome.storage.local.set({ list: list }, function() {
          if (statusDisplay) statusDisplay.value = "Saved!";
          setTimeout(function() { window.close(); }, 500);
        });
      });
    });
  } else {
    chrome.storage.local.get({ list: [] }, function(data) {
      var list = data.list || [];
      list.push(bookmarkDoc);
      chrome.storage.local.set({ list: list }, function() {
        if (statusDisplay) statusDisplay.value = "Saved!";
        setTimeout(function() { window.close(); }, 500);
      });
    });
  }
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
