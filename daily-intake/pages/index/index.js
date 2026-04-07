var util = require('../../utils/util.js');

Page({
  data: {
    dateCN: '',
    greeting: '',
    categories: util.categories,
    records: [],
    loading: true
  },

  onLoad: function() {
    var today = util.formatDate(new Date());
    var hour = new Date().getHours();
    var greeting = '早上好 ☀️';
    if (hour >= 12 && hour < 18) greeting = '下午好 🌤️';
    if (hour >= 18) greeting = '晚上好 🌙';

    this.setData({
      dateCN: util.formatDateCN(today),
      greeting: greeting
    });
  },

  onShow: function() {
    // 每次显示页面时刷新数据
    this.loadTodayRecords();
    // 更新 Tab Bar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  loadTodayRecords: function() {
    var that = this;
    var today = util.formatDate(new Date());
    that.setData({ loading: true });

    wx.cloud.callFunction({
      name: 'getRecords',
      data: { date: today }
    }).then(function(res) {
      that.setData({
        records: res.result.data || [],
        loading: false
      });
    }).catch(function(err) {
      console.error('加载记录失败', err);
      that.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onQuickAdd: function(e) {
    var category = e.currentTarget.dataset.category;
    wx.navigateTo({
      url: '/pages/add-record/add-record?category=' + category
    });
  },

  onAddTap: function() {
    wx.navigateTo({
      url: '/pages/add-record/add-record'
    });
  },

  onCardTap: function(e) {
    var item = e.detail.item;
    wx.navigateTo({
      url: '/pages/add-record/add-record?id=' + item._id
    });
  }
});
