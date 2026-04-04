var seriesData = require('../../utils/seriesData.js');
var cloudDB = require('../../utils/cloudDB.js');

Page({
  data: {
    sortMode: 'chrono',
    seriesGroups: [],
    isLoading: true
  },
  onLoad: function() {
    var that = this;

    // Show local data immediately
    that.setData({
      seriesGroups: seriesData.getSeriesChronological(),
      isLoading: true
    });

    // Try to fetch from cloud
    cloudDB.getSetsGroupedByYear().then(function(groups) {
      if (groups && groups.length > 0) {
        that.setData({
          seriesGroups: groups,
          isLoading: false
        });
      } else {
        that.setData({ isLoading: false });
      }
    }).catch(function() {
      that.setData({ isLoading: false });
    });
  },
  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },
  onSortChrono: function() {
    var groups = this.data.seriesGroups;
    // Re-sort by year descending
    groups.sort(function(a, b) { return b.year.localeCompare(a.year); });
    this.setData({
      sortMode: 'chrono',
      seriesGroups: groups
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
    var code = e.currentTarget.dataset.code;
    wx.showToast({
      title: code + ' — 即将上线',
      icon: 'none',
      duration: 1500
    });
  }
});