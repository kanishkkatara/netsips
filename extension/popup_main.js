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
    if (parsed.protocol === 'chrome:' || parsed.protocol === 'chrome-extension:') {
      return parsed.hostname || 'Chrome';
    }
    return parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    return 'Webpage';
  }
}

function title_trimmer(title, maxLen) {
  if (!title) return '';
  maxLen = maxLen || 50;
  if (title.length >= maxLen) {
    return title.substring(0, maxLen) + '...';
  }
  return title;
}

// Generate aesthetic domain gradient fallback
function getDomainGradient(domain) {
  var d = (domain || '').toLowerCase();
  if (d.includes('github') || d.includes('dev')) {
    return 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)';
  } else if (d.includes('news') || d.includes('medium') || d.includes('post')) {
    return 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #064e3b 100%)';
  } else if (d.includes('youtube') || d.includes('video')) {
    return 'linear-gradient(135deg, #1c1917 0%, #450a0a 50%, #7f1d1d 100%)';
  } else if (d.includes('figma') || d.includes('design')) {
    return 'linear-gradient(135deg, #090d16 0%, #3b0764 50%, #6b21a8 100%)';
  }
  return 'linear-gradient(135deg, #090d16 0%, #131b2e 50%, #064e3b 100%)';
}

function updateActiveTabInfo(tab) {
  if (!tab) return;
  var title = tab.title || '';
  var url = tab.url || '';
  website_url = url;

  var titleEl = document.getElementById("website-title");
  if (titleEl) {
    titleEl.innerText = title || url || 'Current Webpage';
  }

  var domain = extractDomain(url);
  var domainEl = document.getElementById("page-domain");
  if (domainEl) {
    domainEl.innerText = domain;
  }

  var faviconEl = document.getElementById("page-favicon");
  if (faviconEl) {
    var fav = tab.favIconUrl;
    if (!fav && url.startsWith('http')) {
      fav = "https://s2.googleusercontent.com/s2/favicons?domain_url=" + encodeURIComponent(url);
    }
    if (fav) faviconEl.src = fav;
  }

  var bannerEl = document.getElementById("hero-banner");
  if (bannerEl) {
    bannerEl.style.background = getDomainGradient(domain);
  }
}

// Populate active tab details immediately
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  if (tabs && tabs[0]) {
    updateActiveTabInfo(tabs[0]);
  }
});

var recentContainer = document.getElementById('recent-container');

// Render recents from Local-First Database
function renderRecents() {
  if (!recentContainer) return;
  var iconApi = "https://s2.googleusercontent.com/s2/favicons?domain_url=";

  function renderList(items) {
    recentContainer.innerHTML = '';
    if (!items || items.length === 0) {
      recentContainer.innerHTML = '<div class="recent-empty">No recent saves. Items saved will appear here.</div>';
      return;
    }

    items.forEach(function(item) {
      var url = item.articleURL || item.URL || '';
      var title = title_trimmer(item.title || item.Title || url, 40);
      var domain = extractDomain(url);
      var fav = item.Icon || (iconApi + encodeURIComponent(url));

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

function initPopup() {
  chrome.storage.local.get(['recentisOpen'], function(result) {
    var rec = document.getElementById('recent-container');
    var upIcon = document.getElementById('up-icon');
    if (result && result.recentisOpen) {
      if (rec) rec.style.display = 'flex';
      if (upIcon) upIcon.classList.add('open');
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
      var idx = tags.indexOf(tagVal);
      if (idx === -1) {
        tags.push(tagVal);
        chip.classList.add('selected');
      } else {
        tags.splice(idx, 1);
        chip.classList.remove('selected');
      }
      tagsInput.value = tags.join(', ');
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
      chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    });
  }

  var addBookmarkForm = document.getElementById('addbookmark');
  if (addBookmarkForm) {
    addBookmarkForm.addEventListener('submit', addBookmark);
  }

  // Inject content script to fetch active tab details
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs && tabs[0]) {
      updateActiveTabInfo(tabs[0]);
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
          }).catch(function() {});
        } else if (chrome.tabs.executeScript) {
          chrome.tabs.executeScript(tabId, { file: 'content.js' });
        }
      }
    }
  });

  chrome.runtime.onMessage.addListener(function(message) {
    onPageDetailsReceived(message);
  });
}

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

  if (pageDetails.img_url && pageDetails.img_url.indexOf('placeholder.png') === -1) {
    image = pageDetails.img_url;
    var bannerEl = document.getElementById('hero-banner');
    if (bannerEl) {
      bannerEl.style.backgroundImage = 'url(' + pageDetails.img_url + ')';
    }
  }

  if (pageDetails.title) {
    var titleEl = document.getElementById("website-title");
    if (titleEl) titleEl.innerText = pageDetails.title;
  }

  main_site = pageDetails.main_site || '';
}

// Save Bookmark Action
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
    mainSite: main_site || extractDomain(website_url),
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
      saveBtn.innerHTML = '<span>✓ Saved to Library</span>';
    }
    setTimeout(function() {
      window.close();
    }, 550);
  }

  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    LocalDB.bookmarks.add(bookmarkDoc).then(function() {
      handleSaveSuccess();
    }).catch(function(err) {
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

// Immediate fail-safe execution
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPopup);
} else {
  initPopup();
}
