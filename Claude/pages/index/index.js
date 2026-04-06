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

    // Initialize native recorder
    this._initRecorder();
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

  // --- Voice Search (native recorder + cloud STT) ---
  _initRecorder() {
    var that = this;
    this._recorder = wx.getRecorderManager();

    this._recorder.onStop(function(res) {
      that.setData({ isRecording: false });
      if (!res.tempFilePath) {
        wx.showToast({ title: '录音失败', icon: 'none' });
        return;
      }
      // Upload audio and call cloud function for speech-to-text
      wx.showLoading({ title: '正在识别语音...' });
      wx.cloud.uploadFile({
        cloudPath: 'voice-search/' + Date.now() + '.mp3',
        filePath: res.tempFilePath,
        success: function(upRes) {
          wx.cloud.callFunction({
            name: 'voiceToText',
            data: { fileID: upRes.fileID }
          }).then(function(cfRes) {
            wx.hideLoading();
            var text = (cfRes.result && cfRes.result.text) || '';
            if (text.trim()) {
              that.setData({ searchValue: text.trim() });
              wx.navigateTo({
                url: '/pages/results/results?query=' + encodeURIComponent(text.trim())
              });
            } else {
              wx.showToast({ title: '未能识别语音', icon: 'none' });
            }
          }).catch(function(err) {
            wx.hideLoading();
            console.error('Voice STT error:', err);
            wx.showToast({ title: '语音识别失败', icon: 'none' });
          });
        },
        fail: function(err) {
          wx.hideLoading();
          console.error('Voice upload error:', err);
          wx.showToast({ title: '上传录音失败', icon: 'none' });
        }
      });
    });

    this._recorder.onError(function(err) {
      that.setData({ isRecording: false });
      console.error('Recorder error:', err);
      wx.showToast({ title: '录音出错', icon: 'none' });
    });
  },

  onVoiceSearch() {
    var that = this;

    if (this.data.isRecording) {
      // Stop recording
      this._recorder.stop();
      this.setData({ isRecording: false });
      return;
    }

    // Request microphone permission then start
    wx.authorize({
      scope: 'scope.record',
      success: function() {
        that._recorder.start({
          duration: 10000,
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 48000,
          format: 'mp3'
        });
        that.setData({ isRecording: true });
        wx.showToast({ title: '请说出卡牌名称...', icon: 'none', duration: 3000 });
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
