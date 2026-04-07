var util = require('../../utils/util.js');

Page({
  data: {
    userInfo: null,
    totalCount: 0,
    todayCount: 0,
    streakDays: 0,
    categoryStats: []
  },

  onShow: function() {
    this.loadStats();
    var app = getApp();
    if (app.globalData.userInfo) {
      this.setData({ userInfo: app.globalData.userInfo });
    }
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  onLogin: function() {
    var that = this;
    wx.getUserProfile({
      desc: '用于展示用户信息',
      success: function(res) {
        var userInfo = res.userInfo;
        getApp().globalData.userInfo = userInfo;
        that.setData({ userInfo: userInfo });
        // 保存到云端
        wx.cloud.callFunction({
          name: 'login',
          data: { userInfo: userInfo }
        });
      },
      fail: function() {
        wx.showToast({ title: '已取消登录', icon: 'none' });
      }
    });
  },

  loadStats: function() {
    var that = this;
    wx.cloud.callFunction({
      name: 'getRecords',
      data: { stats: true }
    }).then(function(res) {
      var stats = res.result;
      if (!stats) return;

      // 计算分类统计
      var catCounts = stats.categoryCounts || {};
      var maxCount = 1;
      for (var k in catCounts) {
        if (catCounts[k] > maxCount) maxCount = catCounts[k];
      }

      var categoryStats = util.categories.map(function(cat) {
        var count = catCounts[cat.key] || 0;
        return {
          key: cat.key,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          count: count,
          percent: Math.round((count / maxCount) * 100)
        };
      });

      that.setData({
        totalCount: stats.totalCount || 0,
        todayCount: stats.todayCount || 0,
        streakDays: stats.streakDays || 0,
        categoryStats: categoryStats
      });
    }).catch(function(err) {
      console.error('加载统计失败', err);
    });
  }
});
