var seriesData = require('../../utils/seriesData.js');

Page({
  data: {
    sortMode: 'chrono',
    seriesGroups: []
  },
  onLoad() {
    this.setData({
      seriesGroups: seriesData.getSeriesChronological()
    });
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },
  onSortChrono() {
    this.setData({
      sortMode: 'chrono',
      seriesGroups: seriesData.getSeriesChronological()
    });
  },
  onSortAlpha() {
    this.setData({
      sortMode: 'alpha',
      seriesGroups: seriesData.getSeriesAlphabetical()
    });
  },
  onSetTap(e) {
    var code = e.currentTarget.dataset.code;
    wx.showToast({
      title: code + ' — Coming soon',
      icon: 'none',
      duration: 1500
    });
  }
});
