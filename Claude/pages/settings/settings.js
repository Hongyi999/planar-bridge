Page({
  data: {
    version: '1.0.0',
    cacheSize: '0 KB'
  },
  onLoad() {
    var that = this;
    wx.getStorageInfo({
      success: function(res) {
        that.setData({
          cacheSize: (res.currentSize || 0) + ' KB'
        });
      }
    });
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
  },
  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有本地数据吗？这将删除您的收藏列表。',
      confirmText: '确定',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          wx.clearStorageSync();
          // Re-init default lists
          wx.setStorageSync('lists', [
            { id: 'ninja-deck', name: 'Ninja 套牌', color: 'gold', cards: [] },
            { id: 'wishlist', name: '心愿单', color: 'purple', cards: [] },
            { id: 'trade-binder', name: '交换册', color: 'green', cards: [] }
          ]);
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  },
  onAbout() {
    wx.showModal({
      title: 'Planar Bridge',
      content: 'AI-powered Flesh and Blood TCG card search & collection manager.\n\nBuilt with WeChat Mini-Program.',
      showCancel: false,
      confirmText: '好的'
    });
  }
});
