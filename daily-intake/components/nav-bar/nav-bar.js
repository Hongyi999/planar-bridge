Component({
  properties: {
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: false }
  },
  data: {
    statusBarHeight: 20
  },
  lifetimes: {
    attached: function() {
      var that = this;
      wx.getSystemInfo({
        success: function(res) {
          that.setData({ statusBarHeight: res.statusBarHeight || 20 });
        }
      });
    }
  },
  methods: {
    onBack: function() {
      wx.navigateBack({ delta: 1 });
    }
  }
});
