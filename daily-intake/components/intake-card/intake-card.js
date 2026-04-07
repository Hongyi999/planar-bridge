var util = require('../../utils/util.js');

Component({
  properties: {
    item: { type: Object, value: {} }
  },
  data: {
    categoryInfo: {},
    rating: 0,
    ratingStars: [1, 2, 3, 4, 5]
  },
  observers: {
    'item': function(item) {
      if (item && item.category) {
        this.setData({
          categoryInfo: util.getCategoryByKey(item.category),
          rating: item.rating || 0
        });
      }
    }
  },
  methods: {
    onTap: function() {
      this.triggerEvent('tap', { item: this.data.item });
    }
  }
});
