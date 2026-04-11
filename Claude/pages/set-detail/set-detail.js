var cloudDB = require('../../utils/cloudDB.js');
var storageUtil = require('../../utils/storage.js');

Page({
  data: {
    statusBarHeight: 20,
    navTop: 0,
    navHeight: 32,
    navFullHeight: 64,
    setCode: '',
    setName: '',
    setNameCN: '',
    cards: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    isLoading: true,
    isLoadingMore: false,
    viewMode: 'grid'
  },

  _favSet: null,

  onLoad: function(options) {
    var that = this;
    var sysInfo = wx.getSystemInfoSync();
    var menuBtn = wx.getMenuButtonBoundingClientRect();

    // Build favorites set once for O(1) lookups
    that._favSet = {};
    var lists = storageUtil.getLists();
    lists.forEach(function(list) {
      list.cards.forEach(function(id) { that._favSet[id] = true; });
    });

    that.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20,
      navTop: menuBtn.top,
      navHeight: menuBtn.height,
      navFullHeight: menuBtn.bottom + 8,
      setCode: options.code || '',
      setName: decodeURIComponent(options.name || ''),
      setNameCN: decodeURIComponent(options.nameCN || '')
    });

    that._loadCards();
  },

  _loadCards: function() {
    var that = this;
    if (!that.data.hasMore) return;

    var isFirst = that.data.page === 1;
    that.setData(isFirst ? { isLoading: true } : { isLoadingMore: true });

    cloudDB.getCardsBySet(that.data.setCode, that.data.page, that.data.pageSize)
      .then(function(results) {
        var favSet = that._favSet || {};
        results.forEach(function(card) {
          var cardId = card._id || card.id;
          card._isFav = !!favSet[cardId];
        });
        var cards = that.data.cards.concat(results);
        that.setData({
          cards: cards,
          page: that.data.page + 1,
          hasMore: results.length === that.data.pageSize,
          isLoading: false,
          isLoadingMore: false
        });
      })
      .catch(function() {
        that.setData({ isLoading: false, isLoadingMore: false });
      });
  },

  onScrollToLower: function() {
    if (this.data.hasMore && !this.data.isLoadingMore) {
      this._loadCards();
    }
  },

  onImgLoad: function(e) {
    var index = e.currentTarget.dataset.index;
    var key = 'cards[' + index + ']._imgLoaded';
    var update = {};
    update[key] = true;
    this.setData(update);
  },

  onImgError: function(e) {
    var index = e.currentTarget.dataset.index;
    var update = {};
    update['cards[' + index + ']._imgLoaded'] = true;
    update['cards[' + index + ']._imgFailed'] = true;
    this.setData(update);
  },

  onToggleView: function() {
    this.setData({ viewMode: this.data.viewMode === 'grid' ? 'list' : 'grid' });
  },

  onCardTap: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  },

  onStarTap: function(e) {
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var isFav = storageUtil.toggleFavorite(id);
    if (isFav) { this._favSet[id] = true; } else { delete this._favSet[id]; }
    var key = 'cards[' + index + ']._isFav';
    var update = {};
    update[key] = isFav;
    this.setData(update);
    wx.showToast({ title: isFav ? '已收藏' : '已取消收藏', icon: 'none', duration: 1000 });
  },

  goBack: function() {
    wx.navigateBack();
  },

  goHome: function() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
