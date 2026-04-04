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

    // Initialize default collections if not exist (offline fallback)
    const lists = wx.getStorageSync('lists');
    if (!lists || !lists.length) {
      wx.setStorageSync('lists', [
        { id: 'ninja-deck', name: 'Ninja 套牌', color: 'gold', cards: ['mask-of-momentum', 'snapdragon-scalers'] },
        { id: 'wishlist', name: '心愿单', color: 'purple', cards: ['eye-of-ophidia'] },
        { id: 'trade-binder', name: '交换册', color: 'green', cards: [] }
      ]);
    }
  },
  globalData: {
    appName: 'Planar Bridge',
    cloudEnv: 'dev-7gpmka26fbecea2a'
  }
});
