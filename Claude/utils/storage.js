function getLists() {
  return wx.getStorageSync('lists') || [];
}

function saveLists(lists) {
  wx.setStorageSync('lists', lists);
}

function addCardToList(listId, cardId) {
  const lists = getLists();
  const list = lists.find(l => l.id === listId);
  if (list && !list.cards.includes(cardId)) {
    list.cards.push(cardId);
    saveLists(lists);
  }
}

function removeCardFromList(listId, cardId) {
  const lists = getLists();
  const list = lists.find(l => l.id === listId);
  if (list) {
    list.cards = list.cards.filter(id => id !== cardId);
    saveLists(lists);
  }
}

function isCardFavorited(cardId) {
  const lists = getLists();
  return lists.some(l => l.cards.includes(cardId));
}

function getListById(listId) {
  const lists = getLists();
  return lists.find(l => l.id === listId) || null;
}

function toggleFavorite(cardId) {
  const lists = getLists();
  if (!lists.length) return false;
  const firstList = lists[0];
  if (firstList.cards.includes(cardId)) {
    firstList.cards = firstList.cards.filter(id => id !== cardId);
    saveLists(lists);
    return false;
  } else {
    firstList.cards.push(cardId);
    saveLists(lists);
    return true;
  }
}

module.exports = {
  getLists,
  saveLists,
  addCardToList,
  removeCardFromList,
  isCardFavorited,
  getListById,
  toggleFavorite
};
