var cardData = require('../../utils/cardData.js');
var storageUtil = require('../../utils/storage.js');

Page({
  data: {
    statusBarHeight: 20,
    card: null,
    highlightedText: ''
  },
  onLoad(options) {
    var sysInfo = wx.getSystemInfoSync();
    var card = cardData.getCardById(options.id);
    if (card) {
      var highlighted = this.highlightKeywords(card.text, card.keywords);
      this.setData({
        statusBarHeight: sysInfo.statusBarHeight || 20,
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
