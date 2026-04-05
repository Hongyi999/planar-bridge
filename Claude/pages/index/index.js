Page({
  data: {
    statusBarHeight: 20,
    searchValue: '',
    searchFocus: false,
    chips: [
      { text: '传奇装备', type: 'gold', query: 'legendary equipment' },
      { text: '威严攻击', type: 'purple', query: 'majestic attack action' },
      { text: 'Ninja 英雄', type: 'green', query: 'ninja hero' },
      { text: 'Rosetta 新卡', type: 'gold', query: 'rosetta' }
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
    var text = e.currentTarget.dataset.text;
    this.setData({ searchValue: text });
    wx.navigateTo({
      url: '/pages/results/results?query=' + encodeURIComponent(text)
    });
  }
});
