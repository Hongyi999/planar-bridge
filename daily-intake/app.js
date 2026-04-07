App({
  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 以上基础库');
      return;
    }
    wx.cloud.init({
      env: 'cloud1-9gw2xtbdec042c7e',
      traceUser: true
    });
  },
  globalData: {
    userInfo: null
  }
});
