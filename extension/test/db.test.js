/**
 * Unit & Integration Tests for Netsips Local-First Database
 */
const assert = require('assert');

// Mock chrome.storage.local environment
global.chrome = {
  storage: {
    local: {
      _data: { list: [] },
      get: function(keys, cb) {
        if (typeof keys === 'object' && keys.list !== undefined) {
          cb({ list: this._data.list || keys.list });
        } else if (Array.isArray(keys)) {
          var res = {};
          keys.forEach(k => { res[k] = this._data[k]; });
          cb(res);
        } else {
          cb(this._data);
        }
      },
      set: function(obj, cb) {
        Object.assign(this._data, obj);
        if (cb) cb();
      }
    },
    onChanged: { addListener: function() {} }
  }
};

require('../db.js');

async function runTests() {
  console.log('Running Netsips LocalDB automated tests...');

  // 1. Add Bookmark
  const item = await global.LocalDB.bookmarks.add({
    title: 'Local First Architecture',
    articleURL: 'https://example.com/local-first',
    tags: 'offline, indexeddb'
  });
  assert(item.id, 'Expected item to have a generated ID');
  assert.strictEqual(item.title, 'Local First Architecture');

  // 2. Query All Active
  let active = await global.LocalDB.bookmarks.getAll({ status: 100 });
  assert.strictEqual(active.length, 1);

  // 3. Update Bookmark
  await global.LocalDB.bookmarks.update(item.id, { tags: 'updated-tag' });
  const fetched = await global.LocalDB.bookmarks.getById(item.id);
  assert.strictEqual(fetched.tags, 'updated-tag');

  // 4. Archive Bookmark
  await global.LocalDB.bookmarks.archive(item.id);
  active = await global.LocalDB.bookmarks.getAll({ status: 100 });
  let archived = await global.LocalDB.bookmarks.getAll({ status: 102 });
  assert.strictEqual(active.length, 0);
  assert.strictEqual(archived.length, 1);

  // 5. Restore Bookmark
  await global.LocalDB.bookmarks.restore(item.id);
  active = await global.LocalDB.bookmarks.getAll({ status: 100 });
  assert.strictEqual(active.length, 1);

  // 6. Export and Import Data
  const backup = await global.LocalDB.exportData();
  assert.strictEqual(backup.version, 1);
  assert.strictEqual(backup.bookmarks.length, 1);

  // 7. Delete Bookmark
  await global.LocalDB.bookmarks.delete(item.id);
  active = await global.LocalDB.bookmarks.getAll({ status: 100 });
  assert.strictEqual(active.length, 0);

  // 8. Re-import from backup
  const importedCount = await global.LocalDB.importData(backup);
  assert.strictEqual(importedCount, 1);
  active = await global.LocalDB.bookmarks.getAll({ status: 100 });
  assert.strictEqual(active.length, 1);

  console.log('PASS: All 8 LocalDB test cases passed successfully!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('FAIL: LocalDB test failed:', err);
  process.exit(1);
});
