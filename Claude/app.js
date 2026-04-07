App({
  onLaunch() {
    // Initialize cloud development
    if (wx.cloud) {
      wx.cloud.init({
        env: 'dev-7gpmka26fbecea2a',
        traceUser: true
      });

      // Sync collections from cloud in background
      var storageUtil = require('./utils/storage.js');
      storageUtil.syncFromCloud();
    }

    // Initialize empty collections if first launch
    const lists = wx.getStorageSync('lists');
    if (!lists) {
      wx.setStorageSync('lists', []);
    }
  },
  globalData: {
    appName: 'Planar Bridge',
    cloudEnv: 'dev-7gpmka26fbecea2a'
  }
});
