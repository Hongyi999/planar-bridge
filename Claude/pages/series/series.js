var seriesData = require('../../utils/seriesData.js');

Page({
  data: {
    sortMode: 'chrono',
    seriesGroups: [],
    isLoading: true
  },
  onLoad: function() {
    this.setData({
      seriesGroups: seriesData.getSeriesChronological(),
      isLoading: false
    });
  },
  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },
  onSortChrono: function() {
    this.setData({
      sortMode: 'chrono',
      seriesGroups: seriesData.getSeriesChronological()
    });
  },
  onSortAlpha: function() {
    // Flatten and sort alphabetically
    var allSets = [];
    this.data.seriesGroups.forEach(function(group) {
      group.sets.forEach(function(s) { allSets.push(s); });
    });
    allSets.sort(function(a, b) { return a.name.localeCompare(b.name); });
    this.setData({
      sortMode: 'alpha',
      seriesGroups: [{ year: 'A–Z', sets: allSets }]
    });
  },
  onSetTap: function(e) {
    var ds = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/set-detail/set-detail?code=' + ds.code +
        '&name=' + encodeURIComponent(ds.name || '') +
        '&nameCN=' + encodeURIComponent(ds.nameCn || '')
    });
  }
});