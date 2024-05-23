/**
 * Netsips Local-First Database
 * High-performance, offline-first persistent store powered by IndexedDB with chrome.storage.local sync.
 */
(function(global) {
  'use strict';

  var DB_NAME = 'NetsipsLocalDB';
  var DB_VERSION = 1;
  var STORE_BOOKMARKS = 'bookmarks';
  var STORE_SETTINGS = 'settings';
  var CHANNEL_NAME = 'netsips_db_sync';

  var dbInstance = null;
  var listeners = [];
  var broadcastChannel = null;

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
      broadcastChannel.onmessage = function(event) {
        if (event && event.data && event.data.type === 'DB_CHANGE') {
          notifyListeners();
        }
      };
    }
  } catch (e) {
    // BroadcastChannel not available or restricted
  }

  // Cross-context notification via chrome.storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if (namespace === 'local' && (changes._db_sync_tick || changes.list)) {
        notifyListeners();
      }
    });
  }

  function notifyListeners() {
    LocalDB.bookmarks.getAll({ status: 100 }).then(function(items) {
      for (var i = 0; i < listeners.length; i++) {
        try {
          listeners[i](items);
        } catch (err) {
          console.warn('LocalDB listener error:', err);
        }
      }
    });
  }

  function broadcastChange() {
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'DB_CHANGE', timestamp: Date.now() });
      } catch (e) {}
    }
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ _db_sync_tick: Date.now() });
    }
    notifyListeners();
  }

  function openIndexedDB() {
    if (dbInstance) return Promise.resolve(dbInstance);
    if (typeof indexedDB === 'undefined') {
      return Promise.reject(new Error('IndexedDB not supported in this context'));
    }

    return new Promise(function(resolve, reject) {
      var request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = function(event) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_BOOKMARKS)) {
          var bkmkStore = db.createObjectStore(STORE_BOOKMARKS, { keyPath: 'id' });
          bkmkStore.createIndex('status', 'status', { unique: false });
          bkmkStore.createIndex('dateAdded', 'dateAdded', { unique: false });
          bkmkStore.createIndex('articleURL', 'articleURL', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = function(event) {
        dbInstance = event.target.result;
        resolve(dbInstance);
      };

      request.onerror = function(event) {
        console.warn('LocalDB IndexedDB open failed, falling back:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Fallback to chrome.storage.local if IndexedDB is unavailable
  function getStorageList() {
    return new Promise(function(resolve) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get({ list: [] }, function(data) {
          resolve(data.list || []);
        });
      } else {
        resolve([]);
      }
    });
  }

  function setStorageList(items) {
    return new Promise(function(resolve) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ list: items }, resolve);
      } else {
        resolve();
      }
    });
  }

  // Auto-migration from legacy chrome.storage.local.list to IndexedDB
  function migrateLegacyStorage() {
    return getStorageList().then(function(legacyList) {
      if (!legacyList || legacyList.length === 0) return;
      return openIndexedDB().then(function(db) {
        return new Promise(function(resolve) {
          var tx = db.transaction(STORE_BOOKMARKS, 'readwrite');
          var store = tx.objectStore(STORE_BOOKMARKS);
          var countReq = store.count();
          countReq.onsuccess = function() {
            if (countReq.result === 0) {
              legacyList.forEach(function(item, idx) {
                var doc = {
                  id: 'bkmk_' + (item.Date || (Date.now() - idx * 1000)),
                  title: item.Title || item.title || '',
                  articleURL: item.URL || item.articleURL || '',
                  imageUrl: item.imageUrl || '',
                  mainSite: item.mainSite || '',
                  tags: item.Tags || item.tags || '',
                  dateAdded: item.Date ? new Date(item.Date).getTime() : Date.now(),
                  status: (typeof item.status === 'number') ? item.status : 100
                };
                store.put(doc);
              });
            }
            resolve();
          };
          countReq.onerror = function() { resolve(); };
        });
      }).catch(function() {});
    });
  }

  var LocalDB = {
    init: function() {
      return openIndexedDB().then(function() {
        return migrateLegacyStorage();
      }).catch(function() {
        return migrateLegacyStorage();
      });
    },

    bookmarks: {
      add: function(data) {
        var id = data.id || ('bkmk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
        var doc = {
          id: id,
          title: data.title || data.Title || '',
          articleURL: data.articleURL || data.URL || '',
          imageUrl: data.imageUrl || '',
          mainSite: data.mainSite || '',
          tags: data.tags || data.Tags || '',
          dateAdded: data.dateAdded ? (typeof data.dateAdded === 'number' ? data.dateAdded : new Date(data.dateAdded).getTime()) : Date.now(),
          status: (typeof data.status === 'number') ? data.status : 100
        };

        return openIndexedDB().then(function(db) {
          return new Promise(function(resolve, reject) {
            var tx = db.transaction(STORE_BOOKMARKS, 'readwrite');
            var store = tx.objectStore(STORE_BOOKMARKS);
            var req = store.put(doc);
            req.onsuccess = function() { resolve(doc); };
            req.onerror = function(e) { reject(e.target.error); };
          });
        }).catch(function() {
          return getStorageList().then(function(list) {
            list.push(doc);
            return setStorageList(list).then(function() { return doc; });
          });
        }).then(function(savedDoc) {
          // Keep chrome.storage.local.list synchronized for external tools
          getStorageList().then(function(list) {
            var exists = list.some(function(i) { return (i.id && i.id === savedDoc.id) || (i.URL && i.URL === savedDoc.articleURL); });
            if (!exists) {
              list.push({
                id: savedDoc.id,
                Title: savedDoc.title,
                URL: savedDoc.articleURL,
                imageUrl: savedDoc.imageUrl,
                mainSite: savedDoc.mainSite,
                Tags: savedDoc.tags,
                Date: savedDoc.dateAdded,
                status: savedDoc.status
              });
              setStorageList(list);
            }
          });
          broadcastChange();
          return savedDoc;
        });
      },

      getAll: function(options) {
        options = options || {};
        var statusFilter = (typeof options.status === 'number') ? options.status : null;
        var limit = options.limit || 0;

        return openIndexedDB().then(function(db) {
          return new Promise(function(resolve, reject) {
            var tx = db.transaction(STORE_BOOKMARKS, 'readonly');
            var store = tx.objectStore(STORE_BOOKMARKS);
            var req = store.getAll();

            req.onsuccess = function() {
              var results = req.result || [];
              if (statusFilter !== null) {
                results = results.filter(function(b) { return b.status === statusFilter; });
              }
              results.sort(function(a, b) {
                return (b.dateAdded || 0) - (a.dateAdded || 0);
              });
              if (limit > 0) {
                results = results.slice(0, limit);
              }
              resolve(results);
            };
            req.onerror = function(e) { reject(e.target.error); };
          });
        }).catch(function() {
          return getStorageList().then(function(list) {
            var results = list.map(function(item, idx) {
              return {
                id: item.id || ('local_' + idx),
                title: item.Title || item.title || '',
                articleURL: item.URL || item.articleURL || '',
                imageUrl: item.imageUrl || '',
                mainSite: item.mainSite || '',
                tags: item.Tags || item.tags || '',
                dateAdded: item.Date ? new Date(item.Date).getTime() : 0,
                status: (typeof item.status === 'number') ? item.status : 100
              };
            });
            if (statusFilter !== null) {
              results = results.filter(function(b) { return b.status === statusFilter; });
            }
            results.sort(function(a, b) { return (b.dateAdded || 0) - (a.dateAdded || 0); });
            if (limit > 0) {
              results = results.slice(0, limit);
            }
            return results;
          });
        });
      },

      getById: function(id) {
        return openIndexedDB().then(function(db) {
          return new Promise(function(resolve, reject) {
            var tx = db.transaction(STORE_BOOKMARKS, 'readonly');
            var req = tx.objectStore(STORE_BOOKMARKS).get(id);
            req.onsuccess = function() { resolve(req.result || null); };
            req.onerror = function(e) { reject(e.target.error); };
          });
        }).catch(function() {
          return getStorageList().then(function(list) {
            var item = list.find(function(i, idx) {
              return i.id === id || ('local_' + idx) === id || String(i.Date) === String(id) || String(i.dateAdded) === String(id);
            });
            if (!item) return null;
            return {
              id: item.id || id,
              title: item.title || item.Title || '',
              articleURL: item.articleURL || item.URL || '',
              imageUrl: item.imageUrl || '',
              mainSite: item.mainSite || '',
              tags: (item.tags !== undefined) ? item.tags : (item.Tags || ''),
              dateAdded: item.dateAdded || (item.Date ? new Date(item.Date).getTime() : 0),
              status: (typeof item.status === 'number') ? item.status : 100
            };
          });
        });
      },

      update: function(id, changes) {
        return openIndexedDB().then(function(db) {
          return new Promise(function(resolve, reject) {
            var tx = db.transaction(STORE_BOOKMARKS, 'readwrite');
            var store = tx.objectStore(STORE_BOOKMARKS);
            var req = store.get(id);
            req.onsuccess = function() {
              var doc = req.result;
              if (doc) {
                Object.assign(doc, changes);
                store.put(doc).onsuccess = function() {
                  resolve(doc);
                };
              } else {
                // If ID is local index or legacy key
                var allReq = store.getAll();
                allReq.onsuccess = function() {
                  var all = allReq.result || [];
                  var found = null;
                  for (var i = 0; i < all.length; i++) {
                    if (all[i].id === id || ('local_' + i) === id || String(all[i].dateAdded) === String(id)) {
                      found = all[i];
                      break;
                    }
                  }
                  if (found) {
                    Object.assign(found, changes);
                    store.put(found).onsuccess = function() { resolve(found); };
                  } else {
                    resolve(null);
                  }
                };
              }
            };
            req.onerror = function(e) { reject(e.target.error); };
          });
        }).catch(function() { return null; }).then(function(updated) {
          return getStorageList().then(function(list) {
            var found = null;
            for (var i = 0; i < list.length; i++) {
              if (list[i].id === id || ('local_' + i) === id || String(list[i].Date) === String(id) || String(list[i].dateAdded) === String(id)) {
                if (changes.tags !== undefined) {
                  list[i].tags = changes.tags;
                  list[i].Tags = changes.tags;
                }
                if (changes.status !== undefined) list[i].status = changes.status;
                if (changes.title !== undefined) {
                  list[i].title = changes.title;
                  list[i].Title = changes.title;
                }
                found = list[i];
                break;
              }
            }
            return setStorageList(list).then(function() {
              broadcastChange();
              return updated || found;
            });
          });
        });
      },

      archive: function(id) {
        return LocalDB.bookmarks.update(id, { status: 102 });
      },

      restore: function(id) {
        return LocalDB.bookmarks.update(id, { status: 100 });
      },

      delete: function(id) {
        return openIndexedDB().then(function(db) {
          return new Promise(function(resolve, reject) {
            var tx = db.transaction(STORE_BOOKMARKS, 'readwrite');
            var req = tx.objectStore(STORE_BOOKMARKS).delete(id);
            req.onsuccess = function() { resolve(); };
            req.onerror = function(e) { reject(e.target.error); };
          });
        }).catch(function() {}).then(function() {
          return getStorageList().then(function(list) {
            var filtered = list.filter(function(item, idx) {
              return item.id !== id && ('local_' + idx) !== id && String(item.Date) !== String(id) && String(item.dateAdded) !== String(id);
            });
            return setStorageList(filtered);
          });
        }).then(function() {
          broadcastChange();
        });
      },

      clearArchived: function() {
        return openIndexedDB().then(function(db) {
          return new Promise(function(resolve, reject) {
            var tx = db.transaction(STORE_BOOKMARKS, 'readwrite');
            var store = tx.objectStore(STORE_BOOKMARKS);
            var req = store.getAll();
            req.onsuccess = function() {
              var all = req.result || [];
              all.forEach(function(item) {
                if (item.status === 102) {
                  store.delete(item.id);
                }
              });
              resolve();
            };
            req.onerror = function(e) { reject(e.target.error); };
          });
        }).catch(function() {}).then(function() {
          return getStorageList().then(function(list) {
            var active = list.filter(function(i) { return i.status !== 102; });
            return setStorageList(active);
          });
        }).then(function() {
          broadcastChange();
        });
      },

      onSnapshot: function(callback) {
        if (typeof callback === 'function') {
          listeners.push(callback);
          LocalDB.bookmarks.getAll({ status: 100 }).then(function(items) {
            try { callback(items); } catch (e) {}
          });
        }
        return function() {
          var idx = listeners.indexOf(callback);
          if (idx !== -1) listeners.splice(idx, 1);
        };
      }
    },

    settings: {
      get: function(key, defaultValue) {
        return new Promise(function(resolve) {
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get([key], function(res) {
              if (res && res[key] !== undefined) {
                resolve(res[key]);
              } else {
                resolve(defaultValue);
              }
            });
          } else {
            resolve(defaultValue);
          }
        });
      },

      set: function(key, value) {
        return new Promise(function(resolve) {
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            var obj = {};
            obj[key] = value;
            chrome.storage.local.set(obj, resolve);
          } else {
            resolve();
          }
        });
      }
    },

    exportData: function() {
      return LocalDB.bookmarks.getAll().then(function(bookmarks) {
        return {
          version: 1,
          exportedAt: new Date().toISOString(),
          bookmarks: bookmarks
        };
      });
    },

    importData: function(data) {
      if (!data || !Array.isArray(data.bookmarks)) {
        return Promise.reject(new Error('Invalid import data format'));
      }
      var promises = data.bookmarks.map(function(bkmk) {
        return LocalDB.bookmarks.add(bkmk);
      });
      return Promise.all(promises).then(function() {
        broadcastChange();
        return promises.length;
      });
    }
  };

  LocalDB.init();

  global.LocalDB = LocalDB;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this));
