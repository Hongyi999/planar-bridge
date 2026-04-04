Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '搜索',
        iconNormal: '/assets/icons/tab-search.svg',
        iconActive: '/assets/icons/tab-search-active.svg'
      },
      {
        pagePath: '/pages/series/series',
        text: '系列',
        iconNormal: '/assets/icons/tab-series.svg',
        iconActive: '/assets/icons/tab-series-active.svg'
      },
      {
        pagePath: '/pages/lists/lists',
        text: '收藏',
        iconNormal: '/assets/icons/tab-collection.svg',
        iconActive: '/assets/icons/tab-collection-active.svg'
      },
      {
        pagePath: '/pages/settings/settings',
        text: '设置',
        iconNormal: '/assets/icons/tab-settings.svg',
        iconActive: '/assets/icons/tab-settings-active.svg'
      }
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