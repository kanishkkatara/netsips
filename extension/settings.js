/**
 * Netsips Settings & Dashboard (Local-First Edition)
 * Zero external dependencies, offline-first storage via IndexedDB & chrome.storage.
 */

// MINOR UTILITY FUNCTIONS
function title_trimmer(website_title) {
  if (!website_title) return '';
  if (website_title.length >= 70) {
    return website_title.substring(0, 70) + '...';
  }
  return website_title;
}

function date_processing(d) {
  if (!d) return 'Recent';
  var dateObj = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dateObj.getTime())) return 'Recent';
  var months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  var date = dateObj.getDate();
  var month = dateObj.getMonth();
  return date + ' ' + months[month];
}

var favicon = "https://s2.googleusercontent.com/s2/favicons?domain_url=";

function tag_trimmer(a) {
  return a.trim();
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
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
    console.warn('LocalDB get saved bookmarks failed:', err);
    chrome.storage.local.get({ list: [] }, function(data) {
      displayCards(data.list || []);
    });
  });
}

function displayCards(items) {
  var newsContent = document.getElementById('news-content');
  if (!newsContent) return;
  newsContent.innerHTML = '';
  items = items || [];

  if (items.length === 0) {
    newsContent.innerHTML = '<center style="margin:40px;font-family:\'Manrove-tabs\';font-size:18px;color:#666;">No bookmarks saved yet. Click the Netsips icon on any page to save one!</center>';
    return;
  }

  var markers = [];
  items.forEach(function(item, idx) {
    let url = item.articleURL || item.URL || '#';
    let title = title_trimmer(item.title || item.Title || url);
    let time = item.dateAdded ? date_processing(item.dateAdded) : (item.Date ? date_processing(item.Date) : 'Recent');
    let icon = favicon + encodeURIComponent(url);
    let link_tag_name = item.tags || item.Tags || '';
    let key = item.id || ('local_' + idx);
    let img = item.imageUrl || 'images/extension_images/placeholder.png';
    let main_site_name = item.mainSite || '';

    newsContent.innerHTML += `<div class='column'> <div class='card'> <div class='img-container' style='width:280px; height:200px; overflow:hidden; object-fit: cover;'> <span class='topcorner' title='Archive bookmark'><img src='images/extension_images/archive-grey.svg'></span> <a href="${url}" target="_blank"><img class='img-container-tag' src="${img}"></a> </div> <div class='card-info-container'> <span class='card_favicon'><img src="${icon}"></span> <span class='card_site'>${main_site_name}</span> <span class='card_date'>${time}</span> <p class='card_title'><a href="${url}" target="_blank">${title}</a></p> <div><span class='card_tags' style='overflow:hidden;text-overflow:ellipsis;margin-right:10px'>${link_tag_name}</span><span><img src='images/extension_images/edit.png' class='edit' title='Update tags'></span></div> </div> <div class='key' style='display:none'>${key}</div> </div> </div>`;
    if (link_tag_name) markers.push(link_tag_name);
  });

  var topcorners = document.getElementsByClassName('topcorner');
  for (var j = 0; j < topcorners.length; j++) {
    let key = topcorners[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText;
    topcorners[j].onclick = function() {
      hellocard1(key);
    };
  }

  var edits = document.getElementsByClassName('edit');
  for (var k = 0; k < edits.length; k++) {
    let cardEl = edits[k].closest('.card');
    let key = cardEl.getElementsByClassName('key')[0].innerText;
    let card_tags = cardEl.getElementsByClassName('card_tags')[0].innerText;
    let card_title = cardEl.getElementsByClassName('card_title')[0].innerText;
    edits[k].onclick = function() {
      tags1(key, card_tags, card_title);
    };
  }

  if (markers.length > 0) {
    tag_render(markers.filter(onlyUnique).map(function(s) { return s.split(','); }).join().toLowerCase().split(',').map(tag_trimmer).filter(onlyUnique));
    var filter_tags = document.getElementsByClassName("filter_tags");
    for (var i = 0; i < filter_tags.length; i++) {
      filter_tags[i].addEventListener('click', activeTag);
    }
  }
}

// -------------------------------------------------------------
// CARD ACTION HANDLERS
// -------------------------------------------------------------
function hellocard1(key) {
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

function tags1(key, card_tags, card_title) {
  var modal = document.getElementsByClassName("myModal")[0];
  if (!modal) return;
  var titleDisplay = modal.querySelector('label:not([style*="none"])');
  if (titleDisplay) {
    titleDisplay.innerText = (card_title.length < 42) ? card_title : (card_title.substring(0, 42) + '...');
  }
  var titleInput = document.getElementById("title_input");
  if (titleInput) titleInput.value = key;
  var tagInput = document.getElementById("tag_input");
  if (tagInput) tagInput.value = card_tags || '';
  modal.style.display = "block";

  var closeBtn = document.getElementById('close_modal');
  if (closeBtn) closeBtn.onclick = removeModal1;

  var makeChanges = document.getElementById("make_changes_input");
  if (makeChanges) {
    makeChanges.onclick = function() {
      addTags1(key);
    };
  }
}

function removeModal1() {
  var modal = document.getElementsByClassName("myModal")[0];
  if (modal) modal.style.display = "none";
}

function addTags1(key) {
  var submit_btn = document.getElementById("make_changes_input");
  if (submit_btn) submit_btn.value = "Saving...";
  var modal = document.getElementsByClassName("myModal")[0];
  var new_tags = document.getElementById('tag_input').value;

  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    LocalDB.bookmarks.update(key, { tags: new_tags }).then(function() {
      if (modal) modal.style.display = "none";
      if (submit_btn) {
        submit_btn.value = "Saved!";
        setTimeout(function() { submit_btn.value = 'Update tags'; }, 1000);
      }
      renderSavedBookmarks();
    }).catch(function(err) {
      console.error("Error updating tags:", err);
      if (submit_btn) submit_btn.value = 'Update tags';
    });
  } else {
    chrome.storage.local.get({ list: [] }, function(data) {
      var items = data.list || [];
      var idx = parseInt(String(key).replace('local_', ''), 10);
      if (!isNaN(idx) && items[idx]) {
        items[idx].Tags = new_tags;
        chrome.storage.local.set({ list: items }, function() {
          if (modal) modal.style.display = "none";
          if (submit_btn) submit_btn.value = 'Update tags';
          renderSavedBookmarks();
        });
      }
    });
  }
}

// -------------------------------------------------------------
// ARCHIVED BOOKMARKS
// -------------------------------------------------------------
function render_deleted() {
  var delContent = document.getElementById('deleted-content');
  if (!delContent) return;
  delContent.innerHTML = '';

  if (typeof LocalDB === 'undefined' || !LocalDB.bookmarks) {
    delContent.innerHTML = '<center style="margin:40px;font-family:\'Manrove-tabs\';font-size:18px;color:#666;">No archived bookmarks.</center>';
    return;
  }

  LocalDB.bookmarks.getAll({ status: 102 }).then(function(docs) {
    if (!docs || docs.length === 0) {
      delContent.innerHTML = '<center style="margin:40px;font-family:\'Manrove-tabs\';font-size:18px;color:#666;">No archived bookmarks.</center>';
      return;
    }
    docs.forEach(function(doc) {
      let url = doc.articleURL || doc.URL || '#';
      let title = title_trimmer(doc.title || doc.Title || url);
      let time = doc.dateAdded ? date_processing(doc.dateAdded) : (doc.Date ? date_processing(doc.Date) : 'Archived');
      let icon = favicon + encodeURIComponent(url);
      let link_tag_name = doc.tags || doc.Tags || '';
      let key = doc.id;
      let img = doc.imageUrl || 'images/extension_images/placeholder.png';
      let main_site_name = doc.mainSite || '';
      delContent.innerHTML += `<div class='column'> <div class='card'> <div class='img-container' style='width:280px; height:200px; overflow:hidden; object-fit: cover;'> <span class='topcorner1' title='Permanently delete bookmark'><img src='images/extension_images/delete.svg'></span> <a href="${url}" target='_blank'><img class='img-container-tag' src="${img}"></a> </div> <div class='card-info-container'> <span class='card_favicon'><img src="${icon}"></span> <span class='card_site'>${main_site_name}</span> <span class='card_date'>${time}</span> <p class='card_title'><a href="${url}" target='_blank">${title}</a></p> <div><span class='card_tags' style='display:none'>${link_tag_name}</span><span><img src='images/extension_images/restore.svg' class='edit1' title='Restore bookmark'></span></div> </div> <div class='key' style='display:none'>${key}</div> </div> </div>`;
    });

    var topcorners1 = document.getElementsByClassName('topcorner1');
    for (var j = 0; j < topcorners1.length; j++) {
      let key = topcorners1[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText;
      topcorners1[j].onclick = function() {
        this.parentElement.parentElement.style.display = 'none';
        permanent_delete(key);
      };
    }

    var restores = document.getElementsByClassName('edit1');
    for (var k = 0; k < restores.length; k++) {
      let key = restores[k].closest('.card').getElementsByClassName('key')[0].innerText;
      restores[k].onclick = function() {
        this.closest('.card').style.display = 'none';
        restore_card(key);
      };
    }
  }).catch(function(err) {
    console.warn("Deleted fetch error:", err);
    delContent.innerHTML = '<center style="margin:40px;font-family:\'Manrove-tabs\';font-size:18px;color:#666;">No archived bookmarks.</center>';
  });
}

function permanent_delete(key) {
  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    LocalDB.bookmarks.delete(key);
  }
}

function restore_card(key) {
  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    LocalDB.bookmarks.restore(key).then(function() {
      render_deleted();
    });
  }
}

function clearArchive() {
  document.getElementById('deleted-content').innerHTML = '';
  if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
    LocalDB.bookmarks.clearArchived().then(function() {
      render_deleted();
    });
  }
}

// -------------------------------------------------------------
// TAG RENDERING & FILTERING
// -------------------------------------------------------------
function tag_render(tags) {
  var dark = document.getElementById('dark_mode_checkbox');
  var spanContainer = document.getElementById("span_container");
  if (!spanContainer) return;
  spanContainer.innerHTML = '';
  tags.forEach(function(tag) {
    if (tag !== '') {
      if (dark && dark.checked) {
        spanContainer.innerHTML += `<span class="filter_tags" style="background-color: #4c4e4d; color:white">${tag}</span>&nbsp;&nbsp;&nbsp;`;
      } else {
        spanContainer.innerHTML += `<span class="filter_tags" style="background-color: #f1f1f1;">${tag}</span>&nbsp;&nbsp;&nbsp;`;
      }
    }
  });
}

function activeTag() {
  var x = this;
  chrome.storage.local.get(['isDark'], function(result) {
    if (result.isDark) {
      if (x.style.backgroundColor == "rgb(76, 78, 77)") {
        x.style.backgroundColor = "rgb(101, 52, 172)";
        x.style.color = "rgb(255, 255, 255)";
        filter_tag_collector();
      } else {
        x.style.backgroundColor = "rgb(76, 78, 77)";
        x.style.color = "rgb(255, 255, 255)";
        filter_tag_collector();
      }
    } else {
      if (x.style.backgroundColor == "rgb(241, 241, 241)") {
        x.style.backgroundColor = "rgb(101, 52, 172)";
        x.style.color = "rgb(255, 255, 255)";
        filter_tag_collector();
      } else {
        x.style.backgroundColor = "rgb(241, 241, 241)";
        x.style.color = "rgb(0, 0, 0)";
        filter_tag_collector();
      }
    }
  });
}

function filter_tag_collector() {
  var tag_spans = document.getElementsByClassName("filter_tags");
  var filter_tags = [];
  for (var i = 0; i < tag_spans.length; i++) {
    if (tag_spans[i].style.backgroundColor == "rgb(101, 52, 172)") {
      filter_tags.push(tag_spans[i].innerText);
    }
  }
  real_tag_filter(filter_tags);
}

var checker = function(arr, target) {
  return target.every(function(v) { return arr.includes(v); });
};

function real_tag_filter(list) {
  var cards = document.getElementsByClassName("card");
  for (var i = 0; i < cards.length; i++) {
    var tagSpan = cards[i].getElementsByClassName('card_tags')[0];
    if (!tagSpan) continue;
    var tag = tagSpan.innerText.toLowerCase().split(',');
    for (var k = 0; k < tag.length; k++) {
      tag[k] = tag[k].trim();
    }
    if (checker(tag, list)) {
      cards[i].style.display = '';
    } else {
      cards[i].style.display = "none";
    }
  }
}

// -------------------------------------------------------------
// LOCAL-FIRST INITIALIZATION & EVENT LISTENERS
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  // Always active, local-first
  var modal = document.getElementsByClassName('signModal')[0];
  if (modal) modal.style.display = 'none';

  chrome.storage.local.get(['isSigned', 'username', 'isDark', 'isHome', 'days'], function(result) {
    if (!result.isSigned) {
      chrome.storage.local.set({ isSigned: true, key: 'local_user', username: 'Guest' });
    }
    var un = document.getElementById('user-name');
    if (un) {
      un.innerHTML = result.username ? ("hello, " + result.username.toLowerCase()) : "hello, reader";
    }

    if (result.isDark) {
      var darkBox = document.getElementById('dark_mode_checkbox');
      if (darkBox) darkBox.checked = true;
      make_dark();
    } else {
      var darkBox = document.getElementById('dark_mode_checkbox');
      if (darkBox) darkBox.checked = false;
      make_light();
    }

    if (result.isHome) {
      var homeBox = document.getElementById('home_mode_checkbox');
      if (homeBox) homeBox.checked = true;
    }

    // Set saved days setting
    if (result.days) {
      var inputs = document.getElementsByTagName("input");
      for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type === 'radio' && inputs[i].value === result.days) {
          inputs[i].checked = true;
        }
      }
    }
  });

  // Ensure popup is set to popup_main.html
  var actionApi = chrome.action || chrome.browserAction;
  if (actionApi && actionApi.setPopup) {
    actionApi.setPopup({ popup: "popup_main.html" });
  }

  // Profile pictures
  var p = document.getElementsByClassName('profile-picture');
  for (var i = 0; i < p.length; i++) {
    p[i].style.display = "block";
  }

  // Render saved bookmarks immediately
  renderSavedBookmarks();

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

  // Local DB Backup Export/Import
  var exportBtn = document.getElementById('export_db_btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      if (typeof LocalDB !== 'undefined' && LocalDB.exportData) {
        LocalDB.exportData().then(function(backup) {
          var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
          var downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute("download", "netsips_bookmarks_backup_" + new Date().toISOString().slice(0, 10) + ".json");
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
    importBtn.addEventListener('click', function() {
      importFile.click();
    });

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
                importStatus.innerText = `Imported ${count} bookmarks successfully!`;
                setTimeout(function() { importStatus.innerText = ''; }, 4000);
              }
              renderSavedBookmarks();
            }).catch(function(err) {
              alert("Error importing bookmarks: " + err.message);
            });
          }
        } catch (err) {
          alert("Invalid JSON backup file.");
        }
      };
      reader.readAsText(file);
    });
  }

  // Navigation handlers
  ["saved-btn", "dropdown-saved-btn"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", showSaved);
  });

  ["sc", "dropdown-sc"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", showSettings);
  });

  ["archived", "dropdown-archived"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", showArchived);
  });

  ["SignOut", "dropdown-SignOut"].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", handleSignOut);
  });

  // Guest / Offline Mode button
  var guestBtn = document.getElementById('guestbtn');
  if (guestBtn) {
    guestBtn.addEventListener('click', function() {
      if (modal) modal.style.display = 'none';
      chrome.storage.local.set({ isSigned: true, key: 'local_user', username: 'Guest' }, function() {
        renderSavedBookmarks();
      });
    });
  }

  var signinBtn = document.getElementById('signinbtn');
  if (signinBtn) {
    signinBtn.addEventListener('click', function() {
      if (modal) modal.style.display = 'none';
      chrome.storage.local.set({ isSigned: true, key: 'local_user', username: 'Guest' }, function() {
        renderSavedBookmarks();
      });
    });
  }

  // Searchbar for Saved Bookmarks
  var searchBar = document.getElementById('searchBar');
  if (searchBar) {
    searchBar.addEventListener('keyup', function() {
      var filter = this.value.toUpperCase();
      var cards = document.getElementsByClassName('card');
      for (var j = 0; j < cards.length; j++) {
        var titleEl = cards[j].getElementsByClassName('card_title')[0];
        if (titleEl) {
          var txtValue = titleEl.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            cards[j].style.display = "";
          } else {
            cards[j].style.display = "none";
          }
        }
      }
    });
  }

  // Tag search
  var tagSearch = document.getElementById('tagSearch');
  if (tagSearch) {
    tagSearch.addEventListener('keyup', function() {
      var filter = this.value.toUpperCase();
      var cards = document.getElementsByClassName('card');
      for (var j = 0; j < cards.length; j++) {
        var tagEl = cards[j].getElementsByClassName('card_tags')[0];
        if (tagEl) {
          var txtValue = tagEl.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            cards[j].style.display = "";
          } else {
            cards[j].style.display = "none";
          }
        }
      }
    });
  }

  // Dropdown profile menu
  var profPic = document.getElementsByClassName("profile-picture")[0];
  if (profPic) {
    profPic.addEventListener("click", function(e) {
      e.stopPropagation();
      var drop = document.getElementById("dropdown-menu");
      if (drop) {
        drop.style.display = (drop.style.display === "block") ? "none" : "block";
      }
    });
  }

  document.addEventListener("click", function(e) {
    var drop = document.getElementById("dropdown-menu");
    if (drop && drop.style.display === "block") {
      if (!e.target.closest("#dropdown-menu") && !e.target.closest(".profile-picture")) {
        drop.style.display = "none";
      }
    }
  });

  // Settings Save handler
  var submitSettings = document.getElementById("submit-settings");
  if (submitSettings) {
    submitSettings.addEventListener("submit", function(e) {
      if (e && e.preventDefault) e.preventDefault();

      var inputs = document.getElementsByTagName("input");
      var radios = [];
      var checkboxes = [];
      for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type == "radio") radios.push(inputs[i]);
        if (inputs[i].type == "checkbox") checkboxes.push(inputs[i]);
      }
      var options = "";
      for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked == true && radios[i].id != "custom") {
          options = radios[i].value;
        } else if (radios[i].checked == true && radios[i].id == "custom") {
          for (var j = 0; j < checkboxes.length; j++) {
            if (checkboxes[j].checked == true) {
              options = options + String(checkboxes[j].value) + " ";
            }
          }
        }
      }

      if (typeof LocalDB !== 'undefined' && LocalDB.settings) {
        LocalDB.settings.set('days', options);
      }
      chrome.storage.local.set({ days: options }, function() {
        alert("Your settings have been saved!");
      });
    });
  }

  // Homepage checkbox
  var homeBox = document.getElementById('home_mode_checkbox');
  if (homeBox) {
    homeBox.addEventListener('change', function() {
      chrome.storage.local.set({ isHome: this.checked });
    });
  }
});

// -------------------------------------------------------------
// NAVIGATION TABS
// -------------------------------------------------------------
function showSaved() {
  var london = document.getElementById("London");
  var rome = document.getElementById("Rome");
  var paris = document.getElementById("Paris");
  if (london) london.style.display = "none";
  if (rome) rome.style.display = "none";
  if (paris) paris.style.display = "block";
  var drop = document.getElementById("dropdown-menu");
  if (drop) drop.style.display = "none";
  renderSavedBookmarks();
}

function showSettings() {
  var london = document.getElementById("London");
  var rome = document.getElementById("Rome");
  var paris = document.getElementById("Paris");
  if (london) london.style.display = "block";
  if (rome) rome.style.display = "none";
  if (paris) paris.style.display = "none";
  var drop = document.getElementById("dropdown-menu");
  if (drop) drop.style.display = "none";
}

function showArchived() {
  var london = document.getElementById("London");
  var rome = document.getElementById("Rome");
  var paris = document.getElementById("Paris");
  if (london) london.style.display = "none";
  if (rome) rome.style.display = "block";
  if (paris) paris.style.display = "none";
  var clearBtn = document.getElementById("Tag_search_button_del");
  if (clearBtn) {
    clearBtn.onclick = function() {
      clearArchive();
    };
  }
  render_deleted();
  var drop = document.getElementById("dropdown-menu");
  if (drop) drop.style.display = "none";
}

function handleSignOut() {
  chrome.storage.local.set({
    username: "Guest",
    isDark: false
  }, function() {
    renderSavedBookmarks();
    var drop = document.getElementById("dropdown-menu");
    if (drop) drop.style.display = "none";
  });
}

// -------------------------------------------------------------
// DARK / LIGHT THEME
// -------------------------------------------------------------
function make_dark() {
  chrome.storage.local.set({ isDark: true });
  var body = document.getElementsByTagName('body')[0];
  var london = document.getElementById('London');
  var paris = document.getElementById('Paris');
  var rome = document.getElementById('Rome');
  var tabcontent = document.getElementsByClassName('tabcontent')[0];
  if (body) body.style.background = '#242424';
  if (tabcontent) tabcontent.style.background = '#242424';
  if (paris) paris.style.color = 'rgba(255, 255, 255, 0.7)';
  if (london) london.style.color = 'rgba(255, 255, 255, 0.7)';
  if (rome) rome.style.color = 'rgba(255, 255, 255, 0.7)';

  var tags = document.getElementsByClassName('filter_tags');
  for (var j = 0; j < tags.length; j++) {
    tags[j].style.background = '#4c4e4d';
    tags[j].style.color = 'white';
  }
}

function make_light() {
  chrome.storage.local.set({ isDark: false });
  var body = document.getElementsByTagName('body')[0];
  var london = document.getElementById('London');
  var paris = document.getElementById('Paris');
  var rome = document.getElementById('Rome');
  var tabcontent = document.getElementsByClassName('tabcontent')[0];
  if (body) {
    body.style.background = '#fff';
    body.style.color = 'black';
  }
  if (tabcontent) tabcontent.style.background = '#f2f2f2';
  if (paris) paris.style.color = 'black';
  if (rome) rome.style.color = 'black';
  if (london) london.style.color = 'black';

  var tags = document.getElementsByClassName('filter_tags');
  for (var j = 0; j < tags.length; j++) {
    tags[j].style.background = '#f1f1f1';
    tags[j].style.color = 'black';
  }
}
