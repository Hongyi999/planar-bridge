Page({
  data: {
    statusBarHeight: 20,
    searchValue: '',
    searchFocus: false,
    isRecording: false,
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

    // Initialize voice recognition plugin
    this._initVoice();
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
        // Upload image to cloud storage
        wx.cloud.uploadFile({
          cloudPath: 'search-images/' + Date.now() + '.jpg',
          filePath: tempFilePath,
          success: function(upRes) {
            // Call aiSearch with image
            wx.cloud.callFunction({
              name: 'aiSearch',
              data: { imageFileID: upRes.fileID }
            }).then(function(cfRes) {
              wx.hideLoading();
              var result = cfRes.result || {};
              if (result.results && result.results.length > 0) {
                // Navigate to results with the recognized query
                var query = result.recognizedQuery || '图片搜索';
                wx.navigateTo({
                  url: '/pages/results/results?query=' + encodeURIComponent(query) + '&imageFileID=' + encodeURIComponent(upRes.fileID)
                });
              } else {
                wx.showToast({ title: result.summary || '未能识别卡牌', icon: 'none' });
              }
            }).catch(function(err) {
              wx.hideLoading();
              console.error('Image search error:', err);
              wx.showToast({ title: '识别失败，请重试', icon: 'none' });
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
  },

  // --- Voice Search ---
  _initVoice() {
    var that = this;
    // Try to use the built-in speech recognition plugin
    try {
      var plugin = requirePlugin('WechatSI');
      this._voicePlugin = plugin;
      this._voiceManager = plugin.getRecordRecognitionManager();
      this._voiceManager.onRecognize = function(res) {
        // Partial result
        if (res.result) {
          that.setData({ searchValue: res.result });
        }
      };
      this._voiceManager.onStop = function(res) {
        that.setData({ isRecording: false });
        if (res.result) {
          that.setData({ searchValue: res.result });
          // Auto search
          wx.navigateTo({
            url: '/pages/results/results?query=' + encodeURIComponent(res.result.trim())
          });
        } else {
          wx.showToast({ title: '未能识别语音', icon: 'none' });
        }
      };
      this._voiceManager.onError = function(err) {
        that.setData({ isRecording: false });
        console.error('Voice error:', err);
        wx.showToast({ title: '语音识别失败', icon: 'none' });
      };
    } catch (e) {
      console.warn('Voice plugin not available:', e);
      this._voicePlugin = null;
    }
  },

  onVoiceSearch() {
    var that = this;
    if (!this._voicePlugin) {
      wx.showToast({ title: '语音搜索插件未配置', icon: 'none' });
      return;
    }

    if (this.data.isRecording) {
      // Stop recording
      this._voiceManager.stop();
      this.setData({ isRecording: false });
      return;
    }

    // Request microphone permission
    wx.authorize({
      scope: 'scope.record',
      success: function() {
        that._voiceManager.start({ lang: 'zh_CN' });
        that.setData({ isRecording: true });
        wx.showToast({ title: '请说出卡牌名称...', icon: 'none', duration: 3000 });
        // Auto-stop after 10 seconds
        that._voiceTimer = setTimeout(function() {
          if (that.data.isRecording) {
            that._voiceManager.stop();
            that.setData({ isRecording: false });
          }
        }, 10000);
      },
      fail: function() {
        wx.showModal({
          title: '需要录音权限',
          content: '请在设置中允许录音权限以使用语音搜索',
          confirmText: '去设置',
          success: function(res) {
            if (res.confirm) wx.openSetting();
          }
        });
      }
    });
  }
});
