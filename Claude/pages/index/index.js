Page({
  data: {
    statusBarHeight: 20,
    searchValue: '',
    searchFocus: false,
    placeholders: [
      '搜索 Ninja 的传奇装备',
      'Rosetta 系列全部卡牌',
      '价格超过 50 美元的神话卡',
      'Guardian 的防御反应卡',
      '有 Go again 效果的攻击行动',
      '费恩达尔的春之外衣',
      '10 美元以下的威严装备',
      'Wizard 的瞬发法术',
      'Welcome to Rathe 的武器卡',
      '最贵的 Assassin 卡牌'
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
