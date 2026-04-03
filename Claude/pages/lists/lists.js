var storageUtil = require('../../utils/storage.js');
var cardData = require('../../utils/cardData.js');
var theme = require('../../utils/theme.js');

Page({
  data: {
    lists: [],
    selectedIndex: 0,
    selectedCards: [],
    totalCards: 0,
    totalValue: '0.00'
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    this.loadData();
  },
  loadData() {
    var lists = storageUtil.getLists();
    var totalCards = 0;
    var totalValue = 0;

    var enrichedLists = lists.map(function(list) {
      var cards = list.cards.map(function(id) { return cardData.getCardById(id); }).filter(Boolean);
      var listValue = cards.reduce(function(sum, c) { return sum + c.priceMid; }, 0);
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

    var selectedCards = enrichedLists.length > 0 ? enrichedLists[this.data.selectedIndex].cards : [];

    this.setData({
      lists: enrichedLists,
      selectedCards: selectedCards,
      totalCards: totalCards,
      totalValue: totalValue.toFixed(2)
    });
  },
  onSelectList(e) {
    var idx = e.currentTarget.dataset.index;
    this.setData({
      selectedIndex: idx,
      selectedCards: this.data.lists[idx].cards
    });
  },
  onCardTap(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    });
  },
  onCardDelete(e) {
    var cardId = e.currentTarget.dataset.id;
    var list = this.data.lists[this.data.selectedIndex];
    storageUtil.removeCardFromList(list.id, cardId);
    this.loadData();
    wx.showToast({ title: '已移除', icon: 'none' });
  },
  getInitials(name) {
    if (!name) return '';
    var words = name.split(' ');
    if (words.length >= 2) {
      return words[0].charAt(0) + words[1].charAt(0);
    }
    return name.substring(0, 2);
  }
});
