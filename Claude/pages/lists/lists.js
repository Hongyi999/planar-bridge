var storageUtil = require('../../utils/storage.js');
var cardData = require('../../utils/cardData.js');
var cloudDB = require('../../utils/cloudDB.js');
var theme = require('../../utils/theme.js');

// Convert legacy named colors to hex
var NAMED_TO_HEX = {
  gold: '#9B8644', purple: '#6B4C8A', green: '#3D7A5E',
  blue: '#4A82B5', red: '#C4544A', orange: '#D48820'
};
function colorToHex(color) {
  if (!color) return '#9B8644';
  if (color.charAt(0) === '#') return color;
  return NAMED_TO_HEX[color] || '#9B8644';
}

Page({
  data: {
    lists: [],
    selectedIndex: 0,
    selectedCards: [],
    totalCards: 0,
    totalValue: '0.00',
    isLoaded: true,
    isEditMode: false,
    showHint: false,
    showEditPanel: false,
    editName: '',
    editColor: '#9B8644',
    colorPalette: [
      '#9B8644', '#D4A017', '#E8C94A', '#F5DEB3',
      '#C4544A', '#E07B6C', '#D4546A', '#F4A6B0',
      '#D48820', '#E8A040', '#F0C060', '#FDE68A',
      '#3D7A5E', '#5AA87A', '#80C49E', '#A8E6CF',
      '#4A82B5', '#6BA3D6', '#89CFF0', '#B0D4F1',
      '#6B4C8A', '#9370DB', '#B39DDB', '#D1C4E9',
      '#2C2A22', '#6B6355', '#A09A8C', '#D6D0C2'
    ]
  },
  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }

    // Immediate: render from local storage (synchronous)
    this.loadData();

    // Background: sync cloud, only refresh if data changed
    var that = this;
    storageUtil.syncFromCloud().then(function(changed) {
      if (changed) that.loadData();
    }).catch(function() {});

    // First-visit wobble hint
    if (!wx.getStorageSync('lists_hint_shown')) {
      this.setData({ showHint: true });
      setTimeout(function() {
        that.setData({ showHint: false });
        wx.setStorageSync('lists_hint_shown', true);
      }, 2500);
    }
  },
  loadData: function() {
    var that = this;
    var lists = storageUtil.getLists();
    var totalCards = 0;
    var totalValue = 0;

    // First pass: render with local data (instant)
    var enrichedLists = lists.map(function(list) {
      var cards = list.cards.map(function(id) {
        return cardData.getCardById(id);
      }).filter(Boolean);
      var listValue = cards.reduce(function(sum, c) { return sum + (c.priceMid || 0); }, 0);
      totalCards += cards.length;
      totalValue += listValue;
      return {
        id: list.id,
        name: list.name,
        color: list.color,
        hexColor: colorToHex(list.color),
        cardCount: list.cards.length,
        value: listValue.toFixed(2),
        cards: cards
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

    // Second pass: enrich with cloud data (async, may have images)
    var allCardIds = [];
    lists.forEach(function(list) {
      list.cards.forEach(function(id) {
        if (allCardIds.indexOf(id) < 0) allCardIds.push(id);
      });
    });
    if (allCardIds.length === 0) return;

    var promises = allCardIds.map(function(id) { return cloudDB.getCardById(id); });
    Promise.all(promises).then(function(cloudCards) {
      var cardMap = {};
      cloudCards.forEach(function(c) {
        if (c) cardMap[c._id || c.id] = c;
      });

      var cloudTotalCards = 0;
      var cloudTotalValue = 0;
      var cloudEnriched = lists.map(function(list) {
        var cards = list.cards.map(function(id) {
          return cardMap[id] || cardData.getCardById(id);
        }).filter(Boolean);
        var listValue = cards.reduce(function(sum, c) { return sum + (c.priceMid || 0); }, 0);
        cloudTotalCards += cards.length;
        cloudTotalValue += listValue;
        return {
          id: list.id,
          name: list.name,
          color: list.color,
          hexColor: colorToHex(list.color),
          cardCount: list.cards.length,
          value: listValue.toFixed(2),
          cards: cards
        };
      });

      var cloudSelectedCards = cloudEnriched.length > 0
        ? cloudEnriched[Math.min(that.data.selectedIndex, cloudEnriched.length - 1)].cards
        : [];

      that.setData({
        lists: cloudEnriched,
        selectedCards: cloudSelectedCards,
        totalCards: cloudTotalCards,
        totalValue: cloudTotalValue.toFixed(2)
      });
    }).catch(function() {
      // Keep local data on error
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
          lists.unshift({
            id: 'list-' + Date.now(),
            name: res.content.trim(),
            color: nextColor,
            cards: []
          });
          storageUtil.saveLists(lists);
          that.setData({ selectedIndex: 0 });
          that.loadData();
          wx.showToast({ title: '已创建', icon: 'none' });
        }
      }
    });
  },
  onToggleEditMode: function() {
    this.setData({ isEditMode: !this.data.isEditMode });
  },
  onMoveLeft: function(e) {
    var idx = e.currentTarget.dataset.index;
    if (idx <= 0) return;
    var lists = storageUtil.getLists();
    var temp = lists[idx];
    lists[idx] = lists[idx - 1];
    lists[idx - 1] = temp;
    storageUtil.saveLists(lists);
    // Adjust selectedIndex if affected
    var sel = this.data.selectedIndex;
    if (sel === idx) sel = idx - 1;
    else if (sel === idx - 1) sel = idx;
    this.setData({ selectedIndex: sel });
    this.loadData();
  },
  onMoveRight: function(e) {
    var idx = e.currentTarget.dataset.index;
    var lists = storageUtil.getLists();
    if (idx >= lists.length - 1) return;
    var temp = lists[idx];
    lists[idx] = lists[idx + 1];
    lists[idx + 1] = temp;
    storageUtil.saveLists(lists);
    var sel = this.data.selectedIndex;
    if (sel === idx) sel = idx + 1;
    else if (sel === idx + 1) sel = idx;
    this.setData({ selectedIndex: sel });
    this.loadData();
  },
  onListLongPress: function(e) {
    var idx = e.currentTarget.dataset.index;
    this._openEditPanel(idx);
  },
  onOpenEditPanel: function() {
    this._openEditPanel(this.data.selectedIndex);
  },
  _openEditPanel: function(idx) {
    var lists = storageUtil.getLists();
    var list = lists[idx];
    if (!list) return;
    this.setData({
      showEditPanel: true,
      editName: list.name,
      editColor: colorToHex(list.color),
      _editIndex: idx
    });
  },
  onEditPanelNoop: function() {
    // Prevent tap from bubbling to mask
  },
  onCloseEditPanel: function() {
    this.setData({ showEditPanel: false });
  },
  onEditNameInput: function(e) {
    this.setData({ editName: e.detail.value });
  },
  onEditColorTap: function(e) {
    this.setData({ editColor: e.currentTarget.dataset.color });
  },
  onEditSave: function() {
    var idx = this.data._editIndex;
    var lists = storageUtil.getLists();
    if (!lists[idx]) return;

    var nameChanged = false;
    var colorChanged = false;

    if (this.data.editName.trim() && this.data.editName.trim() !== lists[idx].name) {
      lists[idx].name = this.data.editName.trim();
      nameChanged = true;
    }
    if (this.data.editColor !== colorToHex(lists[idx].color)) {
      lists[idx].color = this.data.editColor;
      colorChanged = true;
    }

    if (nameChanged || colorChanged) {
      storageUtil.saveLists(lists);
      this.loadData();
    }

    this.setData({ showEditPanel: false });
    wx.showToast({ title: '已保存', icon: 'none' });
  },
  onEditDelete: function() {
    var that = this;
    var idx = this.data._editIndex;
    var lists = storageUtil.getLists();
    var listName = lists[idx].name;

    wx.showModal({
      title: '删除列表',
      content: '确定要删除「' + listName + '」吗？',
      confirmText: '删除',
      confirmColor: '#C4544A',
      success: function(res) {
        if (res.confirm) {
          lists.splice(idx, 1);
          storageUtil.saveLists(lists);
          var newIdx = Math.min(that.data.selectedIndex, Math.max(0, lists.length - 1));
          that.setData({ selectedIndex: newIdx, showEditPanel: false });
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