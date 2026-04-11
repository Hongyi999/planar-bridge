var storage = require('../../utils/storage.js');

Component({
  properties: {
    card: { type: Object, value: {} },
    index: { type: Number, value: 0 }
  },
  data: {
    isFav: false,
    show: false,
    imgLoaded: false,
    imgFailed: false
  },
  lifetimes: {
    attached() {
      var that = this;
      var cardId = this.properties.card.id || this.properties.card._id;
      this.setData({ isFav: storage.isCardFavorited(cardId) });
      // Stagger animation
      setTimeout(function() {
        that.setData({ show: true });
      }, that.properties.index * 100);
    }
  },
  pageLifetimes: {
    show() {
      var cardId = this.properties.card.id || this.properties.card._id;
      if (cardId) {
        this.setData({ isFav: storage.isCardFavorited(cardId) });
      }
    }
  },
  methods: {
    onImgLoad: function() {
      this.setData({ imgLoaded: true });
    },
    onImgError: function() {
      this.setData({ imgFailed: true, imgLoaded: true });
    },
    onTap() {
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + (this.properties.card.id || this.properties.card._id)
      });
    },
    onStarTap(e) {
      var cardId = this.properties.card.id || this.properties.card._id;

      if (this.data.isFav) {
        // Remove from all lists
        var lists = storage.getLists();
        lists.forEach(function(list) {
          if (list.cards.indexOf(cardId) !== -1) {
            storage.removeCardFromList(list.id, cardId);
          }
        });
        this.setData({ isFav: false });
        wx.showToast({ title: '已取消收藏', icon: 'none', duration: 1000 });
      } else {
        // Add to first list silently
        var lists = storage.getLists();
        if (!lists.length) {
          wx.showToast({ title: '请先创建收藏列表', icon: 'none' });
          return;
        }
        storage.addCardToList(lists[0].id, cardId);
        this.setData({ isFav: true });
        wx.showToast({ title: '已收藏', icon: 'none', duration: 1000 });
      }
    },
    getRarityAbbr() {
      var r = this.properties.card.rarity;
      if (r === 'Legendary') return 'L';
      if (r === 'Majestic') return 'M';
      if (r === 'Rare') return 'R';
      if (r === 'Common') return 'C';
      if (r === 'Fabled') return 'F';
      return '';
    },
    getTrendSymbol() {
      var t = this.properties.card.priceTrend;
      if (t > 0) return '▲ ' + t + '%';
      if (t < 0) return '▼ ' + Math.abs(t) + '%';
      return '— 0%';
    }
  }
});
