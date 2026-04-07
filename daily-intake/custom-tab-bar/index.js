Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '今日', icon: '📋', selectedIcon: '📝' },
      { pagePath: '/pages/list/list', text: '记录', icon: '📁', selectedIcon: '📂' },
      { pagePath: '/pages/profile/profile', text: '我的', icon: '👤', selectedIcon: '😊' }
    ]
  },
  methods: {
    switchTab: function(e) {
      var data = e.currentTarget.dataset;
      wx.switchTab({ url: data.path });
    }
  }
});
