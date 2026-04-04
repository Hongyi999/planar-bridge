var storage = require('../../utils/storage.js');

Component({
  properties: {
    card: { type: Object, value: {} },
    index: { type: Number, value: 0 }
  },
  data: {
    isFav: false,
    show: false
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
  methods: {
    onTap() {
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + (this.properties.card.id || this.properties.card._id)
      });
    },
    onHeartTap(e) {
      var cardId = this.properties.card.id || this.properties.card._id;
      var result = storage.toggleFavorite(cardId);
      this.setData({ isFav: result });
      wx.showToast({
        title: result ? '已收藏' : '已取消',
        icon: 'none',
        duration: 1000
      });
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
