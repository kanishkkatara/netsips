/**
 * Netsips Library & Settings Controller
 * Material Design 3 Google-inspired clean reading list interface.
 */

var faviconApi = "https://s2.googleusercontent.com/s2/favicons?domain_url=";

var ICONS = {
  archive: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
  delete: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>',
  restore: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 1 1 2.05 4.95l-1.42 1.42A9 9 0 1 0 13 3zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>'
};

function title_trimmer(title, maxLen) {
  if (!title) return '';
  maxLen = maxLen || 65;
  if (title.length >= maxLen) {
    return title.substring(0, maxLen) + '...';
  }
  return title;
}

function formatDate(ts) {
  if (!ts) return 'Recent';
  var d = new Date(ts);
  if (isNaN(d.getTime())) return 'Recent';
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[d.getMonth()] + ' ' + d.getDate();
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return 'web';
  }
}

// -------------------------------------------------------------
// RENDER SAVED BOOKMARKS
// -------------------------------------------------------------
function renderSavedBookmarks() {
  var newsContent = document.getElementById('news-content');
  if (!newsContent) return;

  if (typeof LocalDB === 'undefined' || !LocalDB.bookmarks) {
    chrome.storage.local.get({ list: [] }, function(data) {
      displayCards(data.list || []);
    });
    return;
  }

  LocalDB.bookmarks.getAll({ status: 100 }).then(function(items) {
    displayCards(items);
  }).catch(function(err) {
    console.warn('LocalDB get saved bookmarks error:', err);
    chrome.storage.local.get({ list: [] }, function(data) {
      displayCards(data.list || []);
    });
  });
}

function displayCards(items) {
  var newsContent = document.getElementById('news-content');
  var countBadge = document.getElementById('library-count');
  if (!newsContent) return;
  newsContent.innerHTML = '';
  items = items || [];

  if (countBadge) {
    countBadge.innerText = items.length + (items.length === 1 ? ' item' : ' items');
  }

  if (items.length === 0) {
    newsContent.innerHTML = `
      <div class="empty-state-card" id="library-empty-state">
        <div class="empty-state-icon-wrap">
          ${ICONS.bookmark}
        </div>
        <h3 class="empty-state-title">Your reading list is empty</h3>
        <p class="empty-state-desc">
          Save articles, stories, and pages using the Netsips icon in Chrome. Everything is stored locally on your computer.
        </p>
        <button class="btn-sample" id="empty-state-sample-btn">+ Load Sample Articles</button>
      </div>
    `;

    var sampleBtn = document.getElementById('empty-state-sample-btn');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', addSampleBookmarks);
    }
    return;
  }

  var allTags = [];
  items.forEach(function(item, idx) {
    var url = item.articleURL || item.URL || '#';
    var title = title_trimmer(item.title || item.Title || url);
    var domain = extractDomain(url);
    var time = formatDate(item.dateAdded || item.Date);
    var icon = item.Icon || (faviconApi + encodeURIComponent(url));
    var rawTags = item.tags || item.Tags || '';
    var key = item.id || ('local_' + idx);
    var img = item.imageUrl || 'images/extension_images/placeholder.png';

    var tagPills = '';
    if (rawTags) {
      var tagList = rawTags.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
      tagPills = tagList.map(function(t) {
        allTags.push(t);
        return '#' + t;
      }).join(' ');
    }

    newsContent.innerHTML += `
      <div class="column">
        <div class="card">
          <div class="img-container">
            <span class="topcorner" title="Archive">
              ${ICONS.archive}
            </span>
            <a href="${url}" target="_blank" rel="noopener noreferrer">
              <img class="img-container-tag" src="${img}" alt="" onerror="this.src='images/extension_images/placeholder.png'">
            </a>
          </div>
          <div class="card-info-container">
            <div class="card-meta-row">
              <span class="card_favicon"><img src="${icon}" alt="" onerror="this.src='new_icon.png'"></span>
              <span class="card_site">${domain}</span>
              <span class="card_date">${time}</span>
            </div>
            <h3 class="card_title">
              <a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>
            </h3>
            <div class="card-bottom-row">
              <span class="card_tags" data-raw-tags="${rawTags}" title="${rawTags}">${tagPills || '#reading'}</span>
              <span class="edit" title="Edit tags">${ICONS.edit}</span>
            </div>
          </div>
          <div class="key" style="display:none">${key}</div>
        </div>
      </div>
    `;
  });

  // Attach card action listeners
  var topcorners = document.getElementsByClassName('topcorner');
  for (var j = 0; j < topcorners.length; j++) {
    (function(btn) {
      btn.onclick = function() {
        var cardEl = btn.closest('.card');
        var key = cardEl.getElementsByClassName('key')[0].innerText;
        cardEl.style.display = 'none';
        archiveCard(key);
      };
    })(topcorners[j]);
  }

  var edits = document.getElementsByClassName('edit');
  for (var k = 0; k < edits.length; k++) {
    (function(editBtn) {
      editBtn.onclick = function() {
        var cardEl = editBtn.closest('.card');
        var key = cardEl.getElementsByClassName('key')[0].innerText;
        var tagSpan = cardEl.getElementsByClassName('card_tags')[0];
        var rawTags = tagSpan.getAttribute('data-raw-tags') || '';
        var title = cardEl.getElementsByClassName('card_title')[0].innerText;
        openTagModal(key, rawTags, title);
      };
    })(edits[k]);
  }

  // Render tag filter bar
  renderTagFilterBar(allTags);
}

// -------------------------------------------------------------
// SAMPLE DATA GENERATOR
// -------------------------------------------------------------
function addSampleBookmarks() {
  var samples = [
    {
      title: "How to Do Great Work — Paul Graham",
      articleURL: "https://paulgraham.com/greatwork.html",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      mainSite: "paulgraham.com",
      tags: "essays, philosophy",
      dateAdded: Date.now() - 3600000 * 2,
      status: 100
    },
    {
      title: "Building Resilient Distributed Systems at Scale",
      articleURL: "https://github.blog/engineering/distributed-systems",
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
      mainSite: "github.blog",
      tags: "engineering, architecture",
      dateAdded: Date.now() - 3600000 * 8,
      status: 100
    },
    {
      title: "Design Systems in 2026: Generative Tokens",
      articleURL: "https://figma.com/blog/generative-ui-design",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      mainSite: "figma.com",
      tags: "design, ui",
      dateAdded: Date.now() - 3600000 * 24,
      status: 100
    }
  ];

  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    Promise.all(samples.map(function(s) { return LocalDB.bookmarks.add(s); })).then(function() {
      renderSavedBookmarks();
    });
  } else {
    chrome.storage.local.get({ list: [] }, function(data) {
      var list = data.list || [];
      samples.forEach(function(s) { list.push(s); });
      chrome.storage.local.set({ list: list }, function() {
        renderSavedBookmarks();
      });
    });
  }
}

// -------------------------------------------------------------
// CARD ACTION HANDLERS
// -------------------------------------------------------------
function archiveCard(key) {
  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    LocalDB.bookmarks.archive(key).then(function() {
      renderSavedBookmarks();
    });
  } else {
    chrome.storage.local.get({ list: [] }, function(data) {
      var items = data.list || [];
      var idx = parseInt(String(key).replace('local_', ''), 10);
      if (!isNaN(idx) && items[idx]) {
        items.splice(idx, 1);
        chrome.storage.local.set({ list: items }, function() {
          renderSavedBookmarks();
        });
      }
    });
  }
}

function openTagModal(key, currentTags, title) {
  var modal = document.getElementsByClassName("myModal")[0];
  if (!modal) return;
  var titleDisplay = document.getElementById("modal_card_title");
  if (titleDisplay) {
    titleDisplay.innerText = title;
  }
  var titleInput = document.getElementById("title_input");
  if (titleInput) titleInput.value = key;
  var tagInput = document.getElementById("tag_input");
  if (tagInput) tagInput.value = currentTags || '';
  modal.style.display = "flex";

  var closeBtn = document.getElementById('close_modal');
  if (closeBtn) {
    closeBtn.onclick = function() {
      modal.style.display = "none";
    };
  }

  var makeChanges = document.getElementById("make_changes_input");
  if (makeChanges) {
    makeChanges.onclick = function() {
      saveTagChanges(key);
    };
  }
}

function saveTagChanges(key) {
  var modal = document.getElementsByClassName("myModal")[0];
  var tagInput = document.getElementById("tag_input");
  var submitBtn = document.getElementById("make_changes_input");
  var newTags = tagInput ? tagInput.value.trim() : '';

  if (submitBtn) submitBtn.innerText = "Saving...";

  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    LocalDB.bookmarks.update(key, { tags: newTags }).then(function() {
      if (modal) modal.style.display = "none";
      if (submitBtn) submitBtn.innerText = "Save";
      renderSavedBookmarks();
    }).catch(function(err) {
      console.error("Tag update failed:", err);
      if (modal) modal.style.display = "none";
      if (submitBtn) submitBtn.innerText = "Save";
    });
  } else {
    chrome.storage.local.get({ list: [] }, function(data) {
      var items = data.list || [];
      var idx = parseInt(String(key).replace('local_', ''), 10);
      if (!isNaN(idx) && items[idx]) {
        items[idx].tags = newTags;
        items[idx].Tags = newTags;
        chrome.storage.local.set({ list: items }, function() {
          if (modal) modal.style.display = "none";
          if (submitBtn) submitBtn.innerText = "Save";
          renderSavedBookmarks();
        });
      }
    });
  }
}

// -------------------------------------------------------------
// ARCHIVED ITEMS
// -------------------------------------------------------------
function render_deleted() {
  var delContent = document.getElementById('deleted-content');
  if (!delContent) return;
  delContent.innerHTML = '';

  if (typeof LocalDB === 'undefined' || !LocalDB.bookmarks) {
    delContent.innerHTML = '<div class="empty-state-card"><p class="empty-state-desc">No archived bookmarks found.</p></div>';
    return;
  }

  LocalDB.bookmarks.getAll({ status: 102 }).then(function(docs) {
    if (!docs || docs.length === 0) {
      delContent.innerHTML = '<div class="empty-state-card"><p class="empty-state-desc">No archived bookmarks found.</p></div>';
      return;
    }

    docs.forEach(function(doc) {
      var url = doc.articleURL || doc.URL || '#';
      var title = title_trimmer(doc.title || doc.Title || url);
      var domain = extractDomain(url);
      var time = formatDate(doc.dateAdded || doc.Date);
      var icon = doc.Icon || (faviconApi + encodeURIComponent(url));
      var key = doc.id;
      var img = doc.imageUrl || 'images/extension_images/placeholder.png';

      delContent.innerHTML += `
        <div class="column">
          <div class="card">
            <div class="img-container">
              <span class="topcorner1" title="Delete forever">
                ${ICONS.delete}
              </span>
              <a href="${url}" target="_blank" rel="noopener noreferrer">
                <img class="img-container-tag" src="${img}" alt="" onerror="this.src='images/extension_images/placeholder.png'">
              </a>
            </div>
            <div class="card-info-container">
              <div class="card-meta-row">
                <span class="card_favicon"><img src="${icon}" alt="" onerror="this.src='new_icon.png'"></span>
                <span class="card_site">${domain}</span>
                <span class="card_date">${time}</span>
              </div>
              <h3 class="card_title"><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></h3>
              <div class="card-bottom-row">
                <span class="card_tags">Archived</span>
                <span class="edit1" title="Restore bookmark">${ICONS.restore}</span>
              </div>
            </div>
            <div class="key" style="display:none">${key}</div>
          </div>
        </div>
      `;
    });

    var topcorners1 = document.getElementsByClassName('topcorner1');
    for (var j = 0; j < topcorners1.length; j++) {
      (function(btn) {
        btn.onclick = function() {
          var cardEl = btn.closest('.card');
          var key = cardEl.getElementsByClassName('key')[0].innerText;
          cardEl.style.display = 'none';
          LocalDB.bookmarks.delete(key);
        };
      })(topcorners1[j]);
    }

    var restores = document.getElementsByClassName('edit1');
    for (var k = 0; k < restores.length; k++) {
      (function(restoreBtn) {
        restoreBtn.onclick = function() {
          var cardEl = restoreBtn.closest('.card');
          var key = cardEl.getElementsByClassName('key')[0].innerText;
          cardEl.style.display = 'none';
          LocalDB.bookmarks.restore(key).then(function() {
            render_deleted();
          });
        };
      })(restores[k]);
    }
  }).catch(function(err) {
    delContent.innerHTML = '<div class="empty-state-card"><p class="empty-state-desc">No archived bookmarks found.</p></div>';
  });
}

function clearArchive() {
  var delContent = document.getElementById('deleted-content');
  if (delContent) delContent.innerHTML = '';
  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    LocalDB.bookmarks.clearArchived().then(function() {
      render_deleted();
    });
  }
}

// -------------------------------------------------------------
// TAG FILTERING
// -------------------------------------------------------------
function renderTagFilterBar(tagArray) {
  var spanContainer = document.getElementById("span_container");
  if (!spanContainer) return;
  spanContainer.innerHTML = '';

  var uniqueTags = tagArray.filter(function(v, i, self) {
    return v && self.indexOf(v) === i;
  });

  if (uniqueTags.length === 0) return;

  spanContainer.innerHTML = '<span class="filter_tags active-tag" data-tag="__all__">All</span>';

  uniqueTags.forEach(function(tag) {
    var pill = document.createElement('span');
    pill.className = 'filter_tags';
    pill.setAttribute('data-tag', tag.toLowerCase());
    pill.innerText = '#' + tag;
    pill.onclick = function() {
      toggleFilterTag(pill);
    };
    spanContainer.appendChild(pill);
  });

  var allPill = spanContainer.querySelector('[data-tag="__all__"]');
  if (allPill) {
    allPill.onclick = function() {
      var pills = spanContainer.getElementsByClassName('filter_tags');
      for (var p = 0; p < pills.length; p++) {
        pills[p].classList.remove('active-tag');
      }
      allPill.classList.add('active-tag');
      applyTagFilters([]);
    };
  }
}

function toggleFilterTag(el) {
  var spanContainer = document.getElementById("span_container");
  var allPill = spanContainer ? spanContainer.querySelector('[data-tag="__all__"]') : null;
  if (allPill) allPill.classList.remove('active-tag');

  el.classList.toggle('active-tag');

  var activePills = spanContainer.querySelectorAll('.filter_tags.active-tag');
  if (activePills.length === 0 && allPill) {
    allPill.classList.add('active-tag');
    applyTagFilters([]);
    return;
  }

  var selected = [];
  activePills.forEach(function(p) {
    var tagVal = p.getAttribute('data-tag');
    if (tagVal && tagVal !== '__all__') selected.push(tagVal);
  });
  applyTagFilters(selected);
}

function applyTagFilters(tagsList) {
  var cards = document.getElementsByClassName("card");
  if (!tagsList || tagsList.length === 0) {
    for (var j = 0; j < cards.length; j++) {
      cards[j].style.display = '';
    }
    return;
  }

  for (var i = 0; i < cards.length; i++) {
    var tagSpan = cards[i].getElementsByClassName('card_tags')[0];
    if (!tagSpan) continue;
    var raw = (tagSpan.getAttribute('data-raw-tags') || tagSpan.innerText).toLowerCase();
    var cardTags = raw.replace(/#/g, '').split(',').map(function(t) { return t.trim(); });

    var matches = tagsList.every(function(targetTag) {
      return cardTags.includes(targetTag);
    });
    cards[i].style.display = matches ? '' : 'none';
  }
}

// -------------------------------------------------------------
// NAVIGATION TABS
// -------------------------------------------------------------
function setActiveNav(activeId) {
  ['saved-btn', 'sc', 'archived'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) {
      if (id === activeId) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
}

function showSaved() {
  var london = document.getElementById("London");
  var rome = document.getElementById("Rome");
  var paris = document.getElementById("Paris");
  if (london) london.style.display = "none";
  if (rome) rome.style.display = "none";
  if (paris) paris.style.display = "block";
  setActiveNav('saved-btn');
  renderSavedBookmarks();
}

function showSettings() {
  var london = document.getElementById("London");
  var rome = document.getElementById("Rome");
  var paris = document.getElementById("Paris");
  if (london) london.style.display = "block";
  if (rome) rome.style.display = "none";
  if (paris) paris.style.display = "none";
  setActiveNav('sc');
}

function showArchived() {
  var london = document.getElementById("London");
  var rome = document.getElementById("Rome");
  var paris = document.getElementById("Paris");
  if (london) london.style.display = "none";
  if (rome) rome.style.display = "block";
  if (paris) paris.style.display = "none";
  setActiveNav('archived');
  render_deleted();
}

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
function initApp() {
  // Navigation tabs
  var savedBtn = document.getElementById("saved-btn");
  if (savedBtn) savedBtn.addEventListener("click", showSaved);

  var scBtn = document.getElementById("sc");
  if (scBtn) scBtn.addEventListener("click", showSettings);

  var archivedBtn = document.getElementById("archived");
  if (archivedBtn) archivedBtn.addEventListener("click", showArchived);

  // Quick add sample button in header
  var addSampleBtn = document.getElementById("btn-add-sample");
  if (addSampleBtn) addSampleBtn.addEventListener("click", addSampleBookmarks);

  // Clear archive button
  var clearBtn = document.getElementById("Tag_search_button_del");
  if (clearBtn) clearBtn.addEventListener("click", clearArchive);

  // Live search
  var searchBar = document.getElementById('searchBar');
  if (searchBar) {
    searchBar.addEventListener('input', function() {
      var query = this.value.toLowerCase().trim();
      var cards = document.getElementsByClassName('card');
      for (var j = 0; j < cards.length; j++) {
        var cardText = cards[j].innerText.toLowerCase();
        if (cardText.indexOf(query) !== -1) {
          cards[j].style.display = '';
        } else {
          cards[j].style.display = 'none';
        }
      }
    });
  }

  // Backup Export & Import
  var exportBtn = document.getElementById('export_db_btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      if (typeof LocalDB !== 'undefined' && LocalDB.exportData) {
        LocalDB.exportData().then(function(backup) {
          var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
          var downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute("download", "netsips_library_backup_" + new Date().toISOString().slice(0, 10) + ".json");
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
        });
      }
    });
  }

  var importBtn = document.getElementById('import_db_btn');
  var importFile = document.getElementById('import_db_file');
  var importStatus = document.getElementById('import_status');
  if (importBtn && importFile) {
    importBtn.addEventListener('click', function() { importFile.click(); });
    importFile.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(evt) {
        try {
          var jsonData = JSON.parse(evt.target.result);
          if (typeof LocalDB !== 'undefined' && LocalDB.importData) {
            LocalDB.importData(jsonData).then(function(count) {
              if (importStatus) {
                importStatus.innerText = "✓ Imported " + count + " items successfully!";
                setTimeout(function() { importStatus.innerText = ''; }, 3500);
              }
              renderSavedBookmarks();
            });
          }
        } catch (err) {
          alert("Invalid JSON backup file.");
        }
      };
      reader.readAsText(file);
    });
  }

  // Settings: Homepage toggle
  var homeBox = document.getElementById('home_mode_checkbox');
  if (homeBox) {
    chrome.storage.local.get(['isHome'], function(result) {
      if (result && result.isHome) homeBox.checked = true;
    });
    homeBox.addEventListener('change', function() {
      chrome.storage.local.set({ isHome: homeBox.checked });
    });
  }

  // Settings: Schedule form
  var submitSettings = document.getElementById('submit-settings');
  var customRadio = document.getElementById('custom');
  var daysMenu = document.getElementById('days-menu');

  if (submitSettings) {
    submitSettings.addEventListener('change', function() {
      if (customRadio && customRadio.checked) {
        if (daysMenu) daysMenu.style.display = 'flex';
      } else {
        if (daysMenu) daysMenu.style.display = 'none';
      }
    });

    submitSettings.addEventListener('submit', function(e) {
      e.preventDefault();
      var submitBtn = document.getElementById('submit-button');
      if (submitBtn) {
        submitBtn.value = "Saved";
        setTimeout(function() { submitBtn.value = "Save Schedule"; }, 1500);
      }
    });
  }

  // Reactive DB sync listener
  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks && LocalDB.bookmarks.onSnapshot) {
    LocalDB.bookmarks.onSnapshot(function() {
      var paris = document.getElementById('Paris');
      if (paris && paris.style.display !== 'none') {
        renderSavedBookmarks();
      }
      var rome = document.getElementById('Rome');
      if (rome && rome.style.display !== 'none') {
        render_deleted();
      }
    });
  }

  // Render bookmarks immediately
  renderSavedBookmarks();
}

// Fail-safe immediate load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
