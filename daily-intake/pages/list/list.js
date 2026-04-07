var util = require('../../utils/util.js');

Page({
  data: {
    categories: util.categories,
    activeFilter: 'all',
    groupedRecords: [],
    allRecords: [],
    loading: true,
    page: 1,
    hasMore: true
  },

  onShow: function() {
    this.setData({ page: 1, allRecords: [], hasMore: true });
    this.loadRecords();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadRecords();
    }
  },

  loadRecords: function() {
    var that = this;
    that.setData({ loading: true });

    var filter = that.data.activeFilter;
    var params = { page: that.data.page, pageSize: 50 };
    if (filter !== 'all') params.category = filter;

    wx.cloud.callFunction({
      name: 'getRecords',
      data: params
    }).then(function(res) {
      var newRecords = res.result.data || [];
      var all = that.data.allRecords.concat(newRecords);
      that.setData({
        allRecords: all,
        groupedRecords: that._groupByDate(all),
        loading: false,
        hasMore: newRecords.length >= 50,
        page: that.data.page + 1
      });
    }).catch(function(err) {
      console.error('加载记录失败', err);
      that.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onFilter: function(e) {
    var filter = e.currentTarget.dataset.filter;
    this.setData({
      activeFilter: filter,
      page: 1,
      allRecords: [],
      hasMore: true
    });
    this.loadRecords();
  },

  onCardTap: function(e) {
    var item = e.detail.item;
    wx.navigateTo({
      url: '/pages/add-record/add-record?id=' + item._id
    });
  },

  _groupByDate: function(records) {
    var groups = {};
    var order = [];
    for (var i = 0; i < records.length; i++) {
      var date = records[i].date || '未知日期';
      if (!groups[date]) {
        groups[date] = [];
        order.push(date);
      }
      groups[date].push(records[i]);
    }
    return order.map(function(date) {
      return {
        date: date,
        dateCN: util.isToday(date) ? '今天' : util.formatDateCN(date),
        records: groups[date]
      };
    });
  }
});
