var cardData = require('../../utils/cardData.js');
var cloudDB = require('../../utils/cloudDB.js');
var storageUtil = require('../../utils/storage.js');

Page({
  data: {
    statusBarHeight: 20,
    navTop: 0,
    navHeight: 32,
    card: null,
    highlightedText: '',
    heroHeight: 640,
    isLoading: true,
    _touchStartY: 0,
    _startHeroHeight: 640,
    isInCollection: false,
    collectionListNames: [],
    showListModal: false,
    modalLists: []
  },
  onLoad: function(options) {
    var that = this;
    var sysInfo = wx.getSystemInfoSync();
    var menuBtn = wx.getMenuButtonBoundingClientRect();

    that.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20,
      navTop: menuBtn.top,
      navHeight: menuBtn.height,
      isLoading: true
    });

    // Try cloud first, fallback to local
    cloudDB.getCardById(options.id).then(function(card) {
      if (card) {
        card.id = card.id || card._id;
        card._id = card._id || card.id;
        that.setData({
          card: card,
          highlightedText: card.text,
          isLoading: false
        });
        that._refreshCollectionState();
      } else {
        that.setData({ isLoading: false });
      }
    }).catch(function() {
      that.setData({ isLoading: false });
    });
  },
  onShow: function() {
    if (this.data.card) {
      this._refreshCollectionState();
    }
  },
  _refreshCollectionState: function() {
    var cardId = this.data.card.id || this.data.card._id;
    var lists = storageUtil.getLists();
    var inLists = [];
    lists.forEach(function(list) {
      if (list.cards.indexOf(cardId) !== -1) {
        inLists.push(list.name);
      }
    });
    this.setData({
      isInCollection: inLists.length > 0,
      collectionListNames: inLists
    });
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
    this._isDragging = false;
  },
  onHandleTouchMove(e) {
    var deltaY = e.touches[0].clientY - this._touchStartY;
    var deltaRpx = deltaY * this._pxToRpx;
    if (Math.abs(deltaRpx) > 10) this._isDragging = true;
    var newHeight = this._startHeroHeight + deltaRpx;
    // Clamp between 640 (default) and 960 (expanded)
    newHeight = Math.max(640, Math.min(960, newHeight));
    this.setData({ heroHeight: newHeight });
  },
  onHandleTouchEnd() {
    if (this._isDragging) {
      // Snap back to default height
      this.setData({ heroHeight: 640 });
    } else {
      // It was a tap, open preview
      this.onPreviewImage();
    }
    this._isDragging = false;
  },
  onAddToList() {
    var cardId = this.data.card.id || this.data.card._id;
    var lists = storageUtil.getLists();
    if (!lists.length) {
      wx.showToast({ title: '请先创建收藏列表', icon: 'none' });
      return;
    }
    var modalLists = lists.map(function(list) {
      return {
        id: list.id,
        name: list.name,
        checked: list.cards.indexOf(cardId) !== -1
      };
    });
    this.setData({ showListModal: true, modalLists: modalLists });
  },
  onToggleModalList: function(e) {
    var idx = e.currentTarget.dataset.index;
    var key = 'modalLists[' + idx + '].checked';
    var update = {};
    update[key] = !this.data.modalLists[idx].checked;
    this.setData(update);
  },
  onModalConfirm: function() {
    var that = this;
    var cardId = this.data.card.id || this.data.card._id;
    var lists = storageUtil.getLists();
    var addedNames = [];

    this.data.modalLists.forEach(function(ml) {
      var list = lists.find(function(l) { return l.id === ml.id; });
      if (!list) return;
      var isIn = list.cards.indexOf(cardId) !== -1;
      if (ml.checked && !isIn) {
        storageUtil.addCardToList(ml.id, cardId);
        addedNames.push(ml.name);
      } else if (!ml.checked && isIn) {
        storageUtil.removeCardFromList(ml.id, cardId);
      }
    });

    this.setData({ showListModal: false });
    this._refreshCollectionState();

    if (addedNames.length > 0) {
      wx.showToast({ title: '已更新收藏', icon: 'none', duration: 1500 });
    } else {
      wx.showToast({ title: '已更新', icon: 'none', duration: 1000 });
    }
  },
  onModalNoop: function() {
    // Prevent tap from bubbling to mask
  },
  onModalCancel: function() {
    this.setData({ showListModal: false });
  },
  onPreviewImage() {
    var url = this.data.card.cloudImageId || this.data.card.imageUrl;
    if (url) {
      wx.previewImage({
        current: url,
        urls: [url]
      });
    }
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
