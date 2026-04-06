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
  },

  // --- Camera/Image Search ---
  onCameraSearch() {
    var that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: function(res) {
        var tempFilePath = res.tempFiles[0].tempFilePath;
        wx.showLoading({ title: '正在识别卡牌...' });
        wx.cloud.uploadFile({
          cloudPath: 'search-images/' + Date.now() + '.jpg',
          filePath: tempFilePath,
          success: function(upRes) {
            wx.cloud.callFunction({
              name: 'aiSearch',
              data: { imageFileID: upRes.fileID }
            }).then(function(cfRes) {
              wx.hideLoading();
              var result = cfRes.result || {};
              if (result.results && result.results.length > 0) {
                var query = result.recognizedQuery || '图片搜索';
                wx.navigateTo({
                  url: '/pages/results/results?query=' + encodeURIComponent(query) + '&imageFileID=' + encodeURIComponent(upRes.fileID)
                });
              } else {
                var summary = result.summary || '';
                var msg = /Error|Cannot|undefined|null/i.test(summary)
                  ? '未能识别图片中的卡牌，换一张试试'
                  : (summary || '未能识别卡牌，换一张图片试试');
                wx.showToast({ title: msg, icon: 'none', duration: 2500 });
              }
            }).catch(function(err) {
              wx.hideLoading();
              console.error('Image search error:', err);
              wx.showToast({ title: '未能识别图片中的卡牌，换一张试试', icon: 'none' });
            });
          },
          fail: function(err) {
            wx.hideLoading();
            console.error('Upload error:', err);
            wx.showToast({ title: '图片上传失败', icon: 'none' });
          }
        });
      }
    });
  }
});
