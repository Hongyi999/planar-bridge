App({
  onLaunch() {
    // Initialize default collections if not exist
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
    appName: 'Planar Bridge'
  }
});
