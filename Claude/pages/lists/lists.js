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
    totalValue: '0.00',
    isLoaded: false
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
        totalValue: totalValue.toFixed(2),
        isLoaded: true
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
  onCreateList: function() {
    var that = this;
    var colors = ['gold', 'purple', 'green'];
    var nextColor = colors[storageUtil.getLists().length % 3];

    wx.showModal({
      title: '新建列表',
      placeholderText: '输入列表名称',
      editable: true,
      success: function(res) {
        if (res.confirm && res.content && res.content.trim()) {
          var lists = storageUtil.getLists();
          lists.push({
            id: 'list-' + Date.now(),
            name: res.content.trim(),
            color: nextColor,
            cards: []
          });
          storageUtil.saveLists(lists);
          that.loadData();
          // Select the newly created list
          that.setData({ selectedIndex: lists.length - 1 });
          wx.showToast({ title: '已创建', icon: 'none' });
        }
      }
    });
  },
  onListLongPress: function(e) {
    var that = this;
    var idx = e.currentTarget.dataset.index;

    wx.showActionSheet({
      itemList: ['重命名', '更换颜色', '删除列表'],
      success: function(res) {
        if (res.tapIndex === 0) {
          that._renameList(idx);
        } else if (res.tapIndex === 1) {
          that._changeColor(idx);
        } else if (res.tapIndex === 2) {
          that._deleteList(idx);
        }
      }
    });
  },
  _renameList: function(idx) {
    var that = this;
    var lists = storageUtil.getLists();
    var list = lists[idx];

    wx.showModal({
      title: '重命名列表',
      placeholderText: list.name,
      editable: true,
      success: function(res) {
        if (res.confirm && res.content && res.content.trim()) {
          lists[idx].name = res.content.trim();
          storageUtil.saveLists(lists);
          that.loadData();
          wx.showToast({ title: '已重命名', icon: 'none' });
        }
      }
    });
  },
  _changeColor: function(idx) {
    var that = this;
    var colorNames = ['金色', '紫色', '绿色'];
    var colorValues = ['gold', 'purple', 'green'];

    wx.showActionSheet({
      itemList: colorNames,
      success: function(res) {
        var lists = storageUtil.getLists();
        lists[idx].color = colorValues[res.tapIndex];
        storageUtil.saveLists(lists);
        that.loadData();
        wx.showToast({ title: '已更换颜色', icon: 'none' });
      }
    });
  },
  _deleteList: function(idx) {
    var that = this;
    var lists = storageUtil.getLists();
    var listName = lists[idx].name;

    wx.showModal({
      title: '删除列表',
      content: '确定要删除「' + listName + '」吗？列表中的卡牌不会被删除。',
      confirmText: '删除',
      confirmColor: '#C4544A',
      success: function(res) {
        if (res.confirm) {
          lists.splice(idx, 1);
          storageUtil.saveLists(lists);
          // Adjust selected index
          var newIdx = Math.min(that.data.selectedIndex, Math.max(0, lists.length - 1));
          that.setData({ selectedIndex: newIdx });
          that.loadData();
          wx.showToast({ title: '已删除', icon: 'none' });
        }
      }
    });
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