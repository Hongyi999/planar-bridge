Page({
  data: {
    statusBarHeight: 20,
    chips: [
      { text: '传奇装备', type: 'gold', query: 'legendary equipment' },
      { text: '威严攻击', type: 'purple', query: 'majestic attack action' },
      { text: '$5 以下好牌', type: 'green', query: 'under $5' },
      { text: 'Uprising 热门卡', type: 'gold', query: 'uprising' }
    ]
  },
  onLoad() {
    var sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },
  onSearch(e) {
    var query = e.detail.value;
    if (query && query.trim()) {
      wx.navigateTo({
        url: '/pages/results/results?query=' + encodeURIComponent(query.trim())
      });
    }
  },
  onChipTap(e) {
    var query = e.currentTarget.dataset.query;
    wx.navigateTo({
      url: '/pages/results/results?query=' + encodeURIComponent(query)
    });
  }
});
