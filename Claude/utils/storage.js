/**
 * Storage Layer — Local-first with cloud sync.
 * Reads from local storage immediately, syncs to cloud in background.
 */

// ---- Local operations (immediate) ----

function getLists() {
  return wx.getStorageSync('lists') || [];
}

function saveLists(lists) {
  wx.setStorageSync('lists', lists);
  _syncListsToCloud(lists);
}

function addCardToList(listId, cardId) {
  var lists = getLists();
  var list = lists.find(function(l) { return l.id === listId; });
  if (list && list.cards.indexOf(cardId) === -1) {
    list.cards.push(cardId);
    saveLists(lists);
    // Also sync single operation to cloud
    _cloudCall('addCard', { listId: listId, cardId: cardId });
  }
}

function removeCardFromList(listId, cardId) {
  var lists = getLists();
  var list = lists.find(function(l) { return l.id === listId; });
  if (list) {
    list.cards = list.cards.filter(function(id) { return id !== cardId; });
    saveLists(lists);
    _cloudCall('removeCard', { listId: listId, cardId: cardId });
  }
}

function isCardFavorited(cardId) {
  var lists = getLists();
  return lists.some(function(l) { return l.cards.indexOf(cardId) !== -1; });
}

function getListById(listId) {
  var lists = getLists();
  return lists.find(function(l) { return l.id === listId; }) || null;
}

function toggleFavorite(cardId) {
  var lists = getLists();
  if (!lists.length) return false;
  var firstList = lists[0];
  if (firstList.cards.indexOf(cardId) !== -1) {
    firstList.cards = firstList.cards.filter(function(id) { return id !== cardId; });
    saveLists(lists);
    _cloudCall('removeCard', { listId: firstList.id, cardId: cardId });
    return false;
  } else {
    firstList.cards.push(cardId);
    saveLists(lists);
    _cloudCall('addCard', { listId: firstList.id, cardId: cardId });
    return true;
  }
}

// ---- Cloud sync operations (background) ----

/**
 * Pull latest data from cloud and merge into local storage.
 * Call on app launch or when entering collection page.
 */
function syncFromCloud() {
  return new Promise(function(resolve) {
    if (!wx.cloud) { resolve(false); return; }

    _cloudCall('get', {}).then(function(result) {
      if (result && result.success && result.data) {
        var cloudLists = result.data.lists;
        var cloudSettings = result.data.settings;

        if (cloudLists && cloudLists.length > 0) {
          var localLists = getLists();
          var localTime = wx.getStorageSync('lists_updated') || 0;
          var cloudTime = result.data.updatedAt ? new Date(result.data.updatedAt).getTime() : 0;

          // Cloud is newer — use cloud data
          if (cloudTime > localTime) {
            wx.setStorageSync('lists', cloudLists);
            wx.setStorageSync('lists_updated', cloudTime);
          }
        }

        if (cloudSettings) {
          var localSettings = wx.getStorageSync('appSettings');
          if (!localSettings) {
            wx.setStorageSync('appSettings', cloudSettings);
          }
        }

        resolve(true);
      } else {
        resolve(false);
      }
    }).catch(function() {
      resolve(false);
    });
  });
}

/**
 * Push current local lists to cloud.
 */
function _syncListsToCloud(lists) {
  wx.setStorageSync('lists_updated', Date.now());
  _cloudCall('save', { lists: lists }).catch(function() {
    // Silent fail — local data is primary
  });
}

/**
 * Sync settings to cloud.
 */
function syncSettingsToCloud(settings) {
  _cloudCall('saveSettings', { settings: settings }).catch(function() {
    // Silent fail
  });
}

/**
 * Call syncCollection cloud function.
 */
function _cloudCall(action, data) {
  return new Promise(function(resolve, reject) {
    if (!wx.cloud) { reject(new Error('Cloud not available')); return; }

    wx.cloud.callFunction({
      name: 'syncCollection',
      data: Object.assign({ action: action }, data),
      success: function(res) { resolve(res.result); },
      fail: function(err) { reject(err); }
    });
  });
}

module.exports = {
  getLists: getLists,
  saveLists: saveLists,
  addCardToList: addCardToList,
  removeCardFromList: removeCardFromList,
  isCardFavorited: isCardFavorited,
  getListById: getListById,
  toggleFavorite: toggleFavorite,
  syncFromCloud: syncFromCloud,
  syncSettingsToCloud: syncSettingsToCloud
};