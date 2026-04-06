Page({
  data: {
    statusBarHeight: 20,
    searchValue: '',
    searchFocus: false,
    searchPlaceholder: '',
    isRecording: false,
    voiceBars: [8, 8, 8, 8, 8, 8, 8],
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
  },

  // --- Voice Search ---
  _initRecorder() {
    var that = this;
    this._recorder = wx.getRecorderManager();

    // Real-time audio frame for waveform animation
    this._recorder.onFrameRecorded(function(res) {
      if (!res.frameBuffer || !that.data.isRecording) return;
      var data = new Int16Array(res.frameBuffer);
      var sum = 0;
      for (var i = 0; i < data.length; i++) sum += data[i] * data[i];
      var rms = Math.sqrt(sum / data.length);
      var level = Math.min(48, Math.max(8, rms / 200));
      var bars = [];
      for (var j = 0; j < 7; j++) {
        bars.push(Math.round(Math.max(8, level * (0.4 + Math.random() * 0.8))));
      }
      that.setData({ voiceBars: bars });
    });

    // Recording stopped — upload and recognize
    this._recorder.onStop(function(res) {
      that.setData({ isRecording: false, voiceBars: [8, 8, 8, 8, 8, 8, 8] });
      if (!res.tempFilePath) {
        wx.showToast({ title: '录音失败', icon: 'none' });
        return;
      }
      // Show "recognizing" state in placeholder
      that.setData({ searchPlaceholder: '识别中...' });
      wx.cloud.uploadFile({
        cloudPath: 'voice-search/' + Date.now() + '.mp3',
        filePath: res.tempFilePath,
        success: function(upRes) {
          wx.cloud.callFunction({
            name: 'voiceToText',
            data: { fileID: upRes.fileID }
          }).then(function(cfRes) {
            that.setData({ searchPlaceholder: '' });
            var result = cfRes.result || {};
            var text = result.name || result.text || '';
            if (text.trim()) {
              // Fill search box, activate focus — user presses enter to search
              that.setData({ searchValue: text.trim(), searchFocus: true });
            } else {
              wx.showToast({ title: '未能识别语音，请重试', icon: 'none' });
            }
          }).catch(function(err) {
            that.setData({ searchPlaceholder: '' });
            console.error('Voice STT error:', err);
            wx.showToast({ title: '语音识别失败', icon: 'none' });
          });
        },
        fail: function(err) {
          that.setData({ searchPlaceholder: '' });
          console.error('Voice upload error:', err);
          wx.showToast({ title: '上传录音失败', icon: 'none' });
        }
      });
    });

    this._recorder.onError(function(err) {
      that.setData({ isRecording: false, voiceBars: [8, 8, 8, 8, 8, 8, 8], searchPlaceholder: '' });
      console.error('Recorder error:', err);
      wx.showToast({ title: '录音出错', icon: 'none' });
    });
  },

  onVoiceSearch() {
    var that = this;

    if (this.data.isRecording) {
      this._recorder.stop();
      this.setData({ isRecording: false });
      return;
    }

    wx.authorize({
      scope: 'scope.record',
      success: function() {
        that._recorder.start({
          duration: 10000,
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 48000,
          format: 'mp3',
          frameSize: 1
        });
        that.setData({ isRecording: true });
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
