/**
 * Netsips Popup Controller
 * Manages active tab extraction, instant offline-first bookmark saving, and recents preview.
 */

var image = '';
var website_url = '';
var main_site = '';

function extractDomain(url) {
  try {
    var parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    return 'web page';
  }
}

function title_trimmer(website_title, maxLen) {
  if (!website_title) return '';
  maxLen = maxLen || 55;
  if (website_title.length >= maxLen) {
    return website_title.substring(0, maxLen) + '...';
  }
  return website_title;
}

// Populate active tab details immediately
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  if (tabs && tabs[0]) {
    var tab = tabs[0];
    var title = tab.title || '';
    var url = tab.url || '';
    website_url = url;

    var titleEl = document.getElementById("website-title");
    if (titleEl) {
      titleEl.innerText = title || url || 'Untitled Page';
    }

    var domainEl = document.getElementById("page-domain");
    if (domainEl && url) {
      domainEl.innerText = extractDomain(url);
    }

    var faviconEl = document.getElementById("page-favicon");
    if (faviconEl && url) {
      var fav = tab.favIconUrl || ("https://s2.googleusercontent.com/s2/favicons?domain_url=" + encodeURIComponent(url));
      faviconEl.src = fav;
    }

    var bannerEl = document.getElementById("hero-banner");
    if (bannerEl && tab.favIconUrl) {
      // Dynamic fallback background gradient based on URL
      var domain = extractDomain(url);
      bannerEl.style.background = "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)";
    }
  }
});

var recentContainer = document.getElementById('recent-container');

// Render recents from Local-First Database
function renderRecents() {
  if (!recentContainer) return;
  var icon_link = "https://s2.googleusercontent.com/s2/favicons?domain_url=";

  function renderList(items) {
    recentContainer.innerHTML = '';
    if (!items || items.length === 0) {
      recentContainer.innerHTML = '<div class="recent-empty">No saves yet. Saved pages will appear here.</div>';
      return;
    }

    items.forEach(function(item) {
      var url = item.articleURL || item.URL || '';
      var title = title_trimmer(item.title || item.Title || url, 40);
      var domain = extractDomain(url);
      var fav = item.Icon || (icon_link + encodeURIComponent(url));

      var card = document.createElement('a');
      card.className = 'recent-item';
      card.href = url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.innerHTML = `
        <img class="recent-favicon" src="${fav}" alt="" onerror="this.src='images/extension_images/icon_128.png'">
        <div class="recent-details">
          <span class="recent-name">${title}</span>
          <span class="recent-domain">${domain}</span>
        </div>
      `;

      card.addEventListener('click', function(e) {
        e.preventDefault();
        chrome.tabs.create({ url: url });
      });

      recentContainer.appendChild(card);
    });
  }

  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    LocalDB.bookmarks.getAll({ status: 100, limit: 3 }).then(function(items) {
      renderList(items);
    }).catch(function() {
      fallbackStorageRecents();
    });
  } else {
    fallbackStorageRecents();
  }

  function fallbackStorageRecents() {
    chrome.storage.local.get({ list: [] }, function(data) {
      var items = data.list || [];
      var recents = [];
      for (var i = items.length - 1; i >= 0 && recents.length < 3; i--) {
        recents.push(items[i]);
      }
      renderList(recents);
    });
  }
}

renderRecents();

// Recents drawer toggle
var dropMenu = document.getElementById('drop-menu');
if (dropMenu) {
  dropMenu.addEventListener('click', toggleRecents);
}

function toggleRecents() {
  var rec = document.getElementById('recent-container');
  var upIcon = document.getElementById('up-icon');
  if (!rec) return;

  var isCurrentlyOpen = (rec.style.display === 'flex' || rec.style.display === 'block');
  if (isCurrentlyOpen) {
    rec.style.display = 'none';
    if (upIcon) upIcon.classList.remove('open');
    chrome.storage.local.set({ recentisOpen: false });
  } else {
    rec.style.display = 'flex';
    if (upIcon) upIcon.classList.add('open');
    chrome.storage.local.set({ recentisOpen: true });
  }
}

window.addEventListener('load', function() {
  chrome.storage.local.get(['recentisOpen'], function(result) {
    var rec = document.getElementById('recent-container');
    var upIcon = document.getElementById('up-icon');
    if (result && result.recentisOpen) {
      if (rec) rec.style.display = 'flex';
      if (upIcon) upIcon.classList.add('open');
    } else {
      if (rec) rec.style.display = 'none';
      if (upIcon) upIcon.classList.remove('open');
    }
  });

  // Setup quick tag chips
  var quickTags = document.querySelectorAll('.quick-chip');
  var tagsInput = document.getElementById('popup_tags');
  quickTags.forEach(function(chip) {
    chip.addEventListener('click', function() {
      var tagVal = chip.getAttribute('data-tag');
      if (!tagsInput || !tagVal) return;
      var current = tagsInput.value.trim();
      var tags = current ? current.split(',').map(function(t) { return t.trim(); }) : [];
      if (tags.indexOf(tagVal) === -1) {
        tags.push(tagVal);
        tagsInput.value = tags.join(', ');
      }
      tagsInput.focus();
    });
  });

  // Header action buttons
  var settingsIcon = document.getElementById('settings-icon');
  if (settingsIcon) {
    settingsIcon.addEventListener('click', function() {
      chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    });
  }

  var dashboardIcon = document.getElementById('dashboard-icon');
  if (dashboardIcon) {
    dashboardIcon.addEventListener('click', function() {
      chrome.tabs.create({ url: chrome.runtime.getURL('new.html') });
    });
  }
});

// Delivery from content script
function onPageDetailsReceived(pageDetails) {
  if (!pageDetails) return;

  var wordCountEl = document.getElementById('word_count');
  var statWords = document.getElementById('stat-words');
  if (pageDetails.word_count) {
    if (wordCountEl) wordCountEl.innerText = pageDetails.word_count;
    if (statWords) statWords.style.display = 'inline-flex';
  }

  if (pageDetails.url) {
    website_url = pageDetails.url;
    var domainEl = document.getElementById("page-domain");
    if (domainEl) domainEl.innerText = extractDomain(pageDetails.url);
  }

  var estTimeEl = document.getElementById('est_time');
  var statTime = document.getElementById('stat-time');
  if (pageDetails.estimated_time) {
    if (estTimeEl) estTimeEl.innerText = pageDetails.estimated_time + " min read";
    if (statTime) statTime.style.display = 'inline-flex';
  }

  if (pageDetails.img_url) {
    image = pageDetails.img_url;
    var bannerEl = document.getElementById('hero-banner');
    if (bannerEl) {
      bannerEl.style.backgroundImage = 'url(' + pageDetails.img_url + ')';
    }
  }

  main_site = pageDetails.main_site || '';
}

// Add Bookmark submit handler (Local-First)
var addBookmark = function(e) {
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

  var saveBtn = document.getElementById('save');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span>Saving...</span>';
  }

  function handleSaveSuccess() {
    if (saveBtn) {
      saveBtn.classList.add('success');
      saveBtn.innerHTML = '<span>✓ Saved to Netsips</span>';
    }
    setTimeout(function() {
      window.close();
    }, 600);
  }

  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    LocalDB.bookmarks.add(bookmarkDoc).then(function() {
      handleSaveSuccess();
    }).catch(function(err) {
      console.warn("LocalDB save fallback:", err);
      chrome.storage.local.get({ list: [] }, function(data) {
        var list = data.list || [];
        list.push(bookmarkDoc);
        chrome.storage.local.set({ list: list }, function() {
          handleSaveSuccess();
        });
      });
    });
  } else {
    chrome.storage.local.get({ list: [] }, function(data) {
      var list = data.list || [];
      list.push(bookmarkDoc);
      chrome.storage.local.set({ list: list }, function() {
        handleSaveSuccess();
      });
    });
  }
};

// Listeners on startup
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
