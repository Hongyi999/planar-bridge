const cloud = require('wx-server-sdk');
cloud.init({ env: 'dev-7gpmka26fbecea2a' });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action } = event;

  switch (action) {
    case 'get':
      return await getCollection(OPENID);
    case 'save':
      return await saveCollection(OPENID, event.lists, event.settings);
    case 'addCard':
      return await addCardToList(OPENID, event.listId, event.cardId);
    case 'removeCard':
      return await removeCardFromList(OPENID, event.listId, event.cardId);
    case 'saveSettings':
      return await saveSettings(OPENID, event.settings);
    default:
      return { success: false, error: 'Unknown action: ' + action };
  }
};

// Get user's collection document (or create default)
async function getCollection(openid) {
  try {
    const res = await db.collection('user_collections')
      .where({ _openid: openid })
      .limit(1)
      .get();

    if (res.data.length > 0) {
      return { success: true, data: res.data[0] };
    }

    // Create default collection for new user
    const defaultDoc = {
      _openid: openid,
      lists: [
        { id: 'my-collection', name: '我的收藏', color: 'gold', cards: [] },
        { id: 'wishlist', name: '心愿单', color: 'purple', cards: [] },
        { id: 'trade-binder', name: '交换册', color: 'green', cards: [] }
      ],
      settings: {
        sortIndex: 0,
        searchLangIndex: 0,
        viewMode: 'grid',
        currency: 'USD',
        exportFields: []
      },
      updatedAt: new Date()
    };

    const addRes = await db.collection('user_collections').add({ data: defaultDoc });
    defaultDoc._id = addRes._id;
    return { success: true, data: defaultDoc, isNew: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Save full collection (lists + settings)
async function saveCollection(openid, lists, settings) {
  try {
    const existing = await db.collection('user_collections')
      .where({ _openid: openid })
      .limit(1)
      .get();

    var updateData = { updatedAt: new Date() };
    if (lists) updateData.lists = lists;
    if (settings) updateData.settings = settings;

    if (existing.data.length > 0) {
      await db.collection('user_collections')
        .doc(existing.data[0]._id)
        .update({ data: updateData });
    } else {
      updateData._openid = openid;
      if (!updateData.lists) {
        updateData.lists = [
          { id: 'my-collection', name: '我的收藏', color: 'gold', cards: [] },
          { id: 'wishlist', name: '心愿单', color: 'purple', cards: [] },
          { id: 'trade-binder', name: '交换册', color: 'green', cards: [] }
        ];
      }
      await db.collection('user_collections').add({ data: updateData });
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Add a card to a specific list
async function addCardToList(openid, listId, cardId) {
  try {
    const res = await db.collection('user_collections')
      .where({ _openid: openid })
      .limit(1)
      .get();

    if (res.data.length === 0) {
      return { success: false, error: 'Collection not found' };
    }

    var doc = res.data[0];
    var list = doc.lists.find(function(l) { return l.id === listId; });
    if (!list) {
      return { success: false, error: 'List not found: ' + listId };
    }

    if (list.cards.indexOf(cardId) === -1) {
      list.cards.push(cardId);
      await db.collection('user_collections')
        .doc(doc._id)
        .update({ data: { lists: doc.lists, updatedAt: new Date() } });
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Remove a card from a specific list
async function removeCardFromList(openid, listId, cardId) {
  try {
    const res = await db.collection('user_collections')
      .where({ _openid: openid })
      .limit(1)
      .get();

    if (res.data.length === 0) {
      return { success: false, error: 'Collection not found' };
    }

    var doc = res.data[0];
    var list = doc.lists.find(function(l) { return l.id === listId; });
    if (!list) {
      return { success: false, error: 'List not found: ' + listId };
    }

    list.cards = list.cards.filter(function(id) { return id !== cardId; });
    await db.collection('user_collections')
      .doc(doc._id)
      .update({ data: { lists: doc.lists, updatedAt: new Date() } });

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Save only settings
async function saveSettings(openid, settings) {
  try {
    const res = await db.collection('user_collections')
      .where({ _openid: openid })
      .limit(1)
      .get();

    if (res.data.length > 0) {
      await db.collection('user_collections')
        .doc(res.data[0]._id)
        .update({ data: { settings: settings, updatedAt: new Date() } });
    } else {
      await db.collection('user_collections').add({
        data: {
          _openid: openid,
          lists: [
            { id: 'my-collection', name: '我的收藏', color: 'gold', cards: [] },
            { id: 'wishlist', name: '心愿单', color: 'purple', cards: [] },
            { id: 'trade-binder', name: '交换册', color: 'green', cards: [] }
          ],
          settings: settings,
          updatedAt: new Date()
        }
      });
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}