var storageUtil = require('../../utils/storage.js');
var cardData = require('../../utils/cardData.js');
var cloudDB = require('../../utils/cloudDB.js');
var theme = require('../../utils/theme.js');

Page({
  data: {
    lists: [],
    selectedIndex: 0,
    selectedCards: [],
    totalCards: 0,
    totalValue: '0.00'
  },
  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }

    // Sync from cloud in background, then reload
    var that = this;
    storageUtil.syncFromCloud().then(function() {
      that.loadData();
    }).catch(function() {
      that.loadData();
    });
  },
  loadData: function() {
    var that = this;
    var lists = storageUtil.getLists();
    var totalCards = 0;
    var totalValue = 0;

    // Collect all unique card IDs
    var allCardIds = [];
    lists.forEach(function(list) {
      list.cards.forEach(function(id) {
        if (allCardIds.indexOf(id) === -1) allCardIds.push(id);
      });
    });

    // Resolve all cards (try cloud, fallback to local)
    var cardPromises = allCardIds.map(function(id) {
      return cloudDB.getCardById(id).then(function(card) {
        return card;
      });
    });

    Promise.all(cardPromises).then(function(resolvedCards) {
      var cardMap = {};
      resolvedCards.forEach(function(card) {
        if (card) cardMap[card._id || card.id] = card;
      });

      var enrichedLists = lists.map(function(list) {
        var cards = list.cards.map(function(id) {
          return cardMap[id] || null;
        }).filter(Boolean);
        var listValue = cards.reduce(function(sum, c) { return sum + (c.priceMid || 0); }, 0);
        totalCards += cards.length;
        totalValue += listValue;
        return {
          id: list.id,
          name: list.name,
          color: list.color,
          cardCount: cards.length,
          value: listValue.toFixed(2),
          cards: cards,
          colorStyle: theme.listColors[list.color] || theme.listColors.gold
        };
      });

      var selectedCards = enrichedLists.length > 0
        ? enrichedLists[Math.min(that.data.selectedIndex, enrichedLists.length - 1)].cards
        : [];

      that.setData({
        lists: enrichedLists,
        selectedCards: selectedCards,
        totalCards: totalCards,
        totalValue: totalValue.toFixed(2)
      });
    });
  },
  onSelectList: function(e) {
    var idx = e.currentTarget.dataset.index;
    this.setData({
      selectedIndex: idx,
      selectedCards: this.data.lists[idx].cards
    });
  },
  onCardTap: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    });
  },
  onCardDelete: function(e) {
    var cardId = e.currentTarget.dataset.id;
    var list = this.data.lists[this.data.selectedIndex];
    storageUtil.removeCardFromList(list.id, cardId);
    this.loadData();
    wx.showToast({ title: '已移除', icon: 'none' });
  },
  getInitials: function(name) {
    if (!name) return '';
    var words = name.split(' ');
    if (words.length >= 2) {
      return words[0].charAt(0) + words[1].charAt(0);
    }
    return name.substring(0, 2);
  }
});