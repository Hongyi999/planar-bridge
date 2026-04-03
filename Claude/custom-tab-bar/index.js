Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '搜索', icon: 'search' },
      { pagePath: '/pages/series/series', text: '系列', icon: 'grid' },
      { pagePath: '/pages/lists/lists', text: '收藏', icon: 'bookmark' },
      { pagePath: '/pages/settings/settings', text: '设置', icon: 'settings' }
    ]
  },
  methods: {
    switchTab(e) {
      var idx = e.currentTarget.dataset.index;
      var path = this.data.list[idx].pagePath;
      wx.switchTab({ url: path });
    }
  }
});
