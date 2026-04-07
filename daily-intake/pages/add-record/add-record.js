var util = require('../../utils/util.js');

Page({
  data: {
    categories: util.categories,
    selectedCategory: '',
    title: '',
    note: '',
    rating: 0,
    isEdit: false,
    recordId: '',
    submitting: false
  },

  onLoad: function(options) {
    // 预选分类
    if (options.category) {
      this.setData({ selectedCategory: options.category });
    }
    // 编辑模式
    if (options.id) {
      this.setData({ isEdit: true, recordId: options.id });
      this.loadRecord(options.id);
    }
  },

  loadRecord: function(id) {
    var that = this;
    wx.cloud.callFunction({
      name: 'getRecords',
      data: { id: id }
    }).then(function(res) {
      var record = res.result.data;
      if (record) {
        that.setData({
          selectedCategory: record.category || '',
          title: record.title || '',
          note: record.note || '',
          rating: record.rating || 0
        });
      }
    }).catch(function(err) {
      console.error('加载记录失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onSelectCategory: function(e) {
    this.setData({ selectedCategory: e.currentTarget.dataset.key });
  },

  onTitleInput: function(e) {
    this.setData({ title: e.detail.value });
  },

  onNoteInput: function(e) {
    this.setData({ note: e.detail.value });
  },

  onRating: function(e) {
    this.setData({ rating: e.currentTarget.dataset.score });
  },

  onClearRating: function() {
    this.setData({ rating: 0 });
  },

  onSubmit: function() {
    var that = this;

    if (!that.data.selectedCategory) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }
    if (!that.data.title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }

    that.setData({ submitting: true });

    var recordData = {
      category: that.data.selectedCategory,
      title: that.data.title.trim(),
      note: that.data.note.trim(),
      rating: that.data.rating,
      date: util.formatDate(new Date())
    };

    var funcName = that.data.isEdit ? 'updateRecord' : 'addRecord';
    var params = that.data.isEdit
      ? { id: that.data.recordId, data: recordData }
      : { data: recordData };

    wx.cloud.callFunction({
      name: funcName,
      data: params
    }).then(function() {
      wx.showToast({ title: that.data.isEdit ? '已更新' : '已添加', icon: 'success' });
      setTimeout(function() {
        wx.navigateBack();
      }, 800);
    }).catch(function(err) {
      console.error('保存失败', err);
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
      that.setData({ submitting: false });
    });
  },

  onDelete: function() {
    var that = this;
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      confirmColor: '#ff4d4f',
      success: function(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'deleteRecord',
            data: { id: that.data.recordId }
          }).then(function() {
            wx.showToast({ title: '已删除', icon: 'success' });
            setTimeout(function() {
              wx.navigateBack();
            }, 800);
          }).catch(function(err) {
            console.error('删除失败', err);
            wx.showToast({ title: '删除失败', icon: 'none' });
          });
        }
      }
    });
  }
});
