var cardData = require('../../utils/cardData.js');
var storageUtil = require('../../utils/storage.js');

Page({
  data: {
    statusBarHeight: 20,
    navTop: 0,
    navHeight: 32,
    card: null,
    highlightedText: '',
    heroHeight: 560,
    _touchStartY: 0,
    _startHeroHeight: 560
  },
  onLoad(options) {
    var sysInfo = wx.getSystemInfoSync();
    var menuBtn = wx.getMenuButtonBoundingClientRect();
    var card = cardData.getCardById(options.id);
    if (card) {
      var highlighted = this.highlightKeywords(card.text, card.keywords);
      this.setData({
        statusBarHeight: sysInfo.statusBarHeight || 20,
        navTop: menuBtn.top,
        navHeight: menuBtn.height,
        card: card,
        highlightedText: highlighted
      });
    }
  },
  highlightKeywords(text, keywords) {
    // For WXML we just return text as-is; keywords are handled in template
    return text;
  },
  goBack() {
    wx.navigateBack();
  },
  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },
  onHandleTouchStart(e) {
    this._touchStartY = e.touches[0].clientY;
    this._startHeroHeight = this.data.heroHeight;
    this._pxToRpx = 750 / wx.getSystemInfoSync().windowWidth;
  },
  onHandleTouchMove(e) {
    var deltaY = e.touches[0].clientY - this._touchStartY;
    var deltaRpx = deltaY * this._pxToRpx;
    var newHeight = this._startHeroHeight + deltaRpx;
    // Clamp between 560 (default) and 900 (expanded)
    newHeight = Math.max(560, Math.min(900, newHeight));
    this.setData({ heroHeight: newHeight });
  },
  onHandleTouchEnd() {
    // Snap back to default height
    this.setData({ heroHeight: 560 });
  },
  onAddToList() {
    var that = this;
    var lists = storageUtil.getLists();
    var names = lists.map(function(l) { return l.name; });

    wx.showActionSheet({
      itemList: names,
      success: function(res) {
        var list = lists[res.tapIndex];
        storageUtil.addCardToList(list.id, that.data.card.id);
        wx.showToast({
          title: '已加入 ' + list.name,
          icon: 'none',
          duration: 1500
        });
      }
    });
  },
  onCopyLink() {
    if (this.data.card && this.data.card.tcgplayerUrl) {
      wx.setClipboardData({
        data: this.data.card.tcgplayerUrl,
        success: function() {
          wx.showToast({ title: '链接已复制', icon: 'none' });
        }
      });
    }
  }
});
