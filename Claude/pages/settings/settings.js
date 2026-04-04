var storageUtil = require('../../utils/storage.js');
var cardData = require('../../utils/cardData.js');

var DEFAULT_SETTINGS = {
  sortIndex: 0,
  searchLangIndex: 0,
  viewMode: 'grid',
  currency: 'USD',
  exportFields: [
    { key: 'name', label: '英文名称', checked: true },
    { key: 'nameCN', label: '中文名称', checked: true },
    { key: 'set', label: '系列', checked: true },
    { key: 'rarity', label: '稀有度', checked: true },
    { key: 'class', label: '职业', checked: true },
    { key: 'type', label: '类型', checked: true },
    { key: 'cost', label: '费用', checked: false },
    { key: 'priceMid', label: '中位价格', checked: true },
    { key: 'priceLow', label: '最低价格', checked: false },
    { key: 'priceMarket', label: '市场价格', checked: false },
    { key: 'cardCode', label: '卡牌编号', checked: false },
    { key: 'text', label: '卡牌文本', checked: false }
  ]
};

function getSettings() {
  var saved = wx.getStorageSync('appSettings');
  if (!saved) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  // Merge with defaults to handle new fields
  var merged = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  if (saved.sortIndex !== undefined) merged.sortIndex = saved.sortIndex;
  if (saved.searchLangIndex !== undefined) merged.searchLangIndex = saved.searchLangIndex;
  if (saved.viewMode) merged.viewMode = saved.viewMode;
  if (saved.currency) merged.currency = saved.currency;
  if (saved.exportFields) merged.exportFields = saved.exportFields;
  return merged;
}

function saveSettings(settings) {
  wx.setStorageSync('appSettings', settings);
}

Page({
  data: {
    version: '1.0.0',
    cacheSize: '0 KB',
    dbCardCount: '—',
    dbSetCount: '—',
    dbImageCount: '—',
    sortIndex: 0,
    sortOptions: ['价格从高到低', '价格从低到高', '名称 A-Z', '名称 Z-A', '系列'],
    searchLangIndex: 0,
    searchLangOptions: ['中英双语', '仅中文', '仅英文'],
    viewMode: 'grid',
    currency: 'USD',
    exportFields: DEFAULT_SETTINGS.exportFields,
    showExportModal: false,
    exportLists: [],
    exportFormat: 'csv'
  },

  onLoad() {
    var that = this;
    var settings = getSettings();
    wx.getStorageInfo({
      success: function(res) {
        that.setData({
          cacheSize: (res.currentSize || 0) + ' KB',
          sortIndex: settings.sortIndex,
          searchLangIndex: settings.searchLangIndex,
          viewMode: settings.viewMode,
          currency: settings.currency,
          exportFields: settings.exportFields
        });
      }
    });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    this.onRefreshDbStats();
  },

  // --- Card Database Import ---
  // Data URLs (client-side fetch, works from user's phone)
  _DATA_URLS: {
    cards: 'https://cdn.jsdelivr.net/gh/the-fab-cube/flesh-and-blood-cards@develop/json/english/card.json',
    sets: 'https://cdn.jsdelivr.net/gh/the-fab-cube/flesh-and-blood-cards@develop/json/english/set.json'
  },

  onRefreshDbStats() {
    var that = this;
    wx.cloud.callFunction({ name: 'importCards', data: { action: 'stats' } }).then(function(res) {
      that.setData({
        dbCardCount: res.result.cardCount || 0,
        dbSetCount: res.result.setCount || 0
      });
    }).catch(function() {
      wx.showToast({ title: '查询失败', icon: 'none' });
    });
    wx.cloud.callFunction({ name: 'importImages', data: { action: 'stats' } }).then(function(res) {
      that.setData({ dbImageCount: res.result.withCloudImage || 0 });
    }).catch(function() {});
  },

  onImportCards() {
    var that = this;
    wx.showModal({
      title: '导入卡牌数据',
      content: '将下载全部 FAB 卡牌数据并写入云数据库。数据较大（约10MB），请确保网络通畅。',
      confirmText: '开始',
      success: function(res) {
        if (res.confirm) {
          that._fetchAndImportCards();
        }
      }
    });
  },

  _fetchAndImportCards() {
    var that = this;
    wx.showLoading({ title: '下载卡牌数据...' });
    wx.request({
      url: that._DATA_URLS.cards,
      method: 'GET',
      dataType: 'json',
      timeout: 60000,
      success: function(res) {
        if (res.statusCode !== 200 || !Array.isArray(res.data)) {
          wx.hideLoading();
          wx.showToast({ title: '下载失败: HTTP ' + res.statusCode, icon: 'none' });
          return;
        }
        var allCards = res.data;
        wx.hideLoading();
        wx.showModal({
          title: '下载成功',
          content: '共 ' + allCards.length + ' 张卡牌。将分批写入数据库，每批 20 张。',
          confirmText: '开始写入',
          success: function(modal) {
            if (modal.confirm) {
              that._allCardsCache = allCards;
              that._writeCardBatch(0, 20);
            }
          }
        });
      },
      fail: function(err) {
        wx.hideLoading();
        wx.showToast({ title: '网络错误: ' + (err.errMsg || ''), icon: 'none' });
      }
    });
  },

  _writeCardBatch(offset, batchSize) {
    var that = this;
    var allCards = that._allCardsCache;
    if (!allCards) return;

    var batch = allCards.slice(offset, offset + batchSize);
    if (batch.length === 0) {
      that._allCardsCache = null;
      wx.showToast({ title: '全部导入完成！', icon: 'success' });
      that.onRefreshDbStats();
      return;
    }

    wx.showLoading({ title: '写入 ' + offset + '/' + allCards.length + '...' });
    wx.cloud.callFunction({
      name: 'importCards',
      data: { action: 'writeCards', cards: batch }
    }).then(function(res) {
      wx.hideLoading();
      var r = res.result;
      var nextOffset = offset + batchSize;
      if (nextOffset < allCards.length) {
        // Auto-continue without asking
        that._writeCardBatch(nextOffset, batchSize);
      } else {
        that._allCardsCache = null;
        wx.showToast({ title: '全部 ' + allCards.length + ' 张卡牌导入完成！', icon: 'success' });
        that.onRefreshDbStats();
      }
    }).catch(function(err) {
      wx.hideLoading();
      wx.showModal({
        title: '写入出错 (offset: ' + offset + ')',
        content: (err.message || err.errMsg || '未知错误') + '\n是否重试？',
        confirmText: '重试',
        cancelText: '取消',
        success: function(modal) {
          if (modal.confirm) that._writeCardBatch(offset, batchSize);
          else {
            that._allCardsCache = null;
            that.onRefreshDbStats();
          }
        }
      });
    });
  },

  onImportImages() {
    var that = this;
    wx.showModal({
      title: '下载卡牌图片',
      content: '将下载官方卡图到微信云存储。每批处理 5 张，可能需要很多次执行。是否开始？',
      confirmText: '开始下载',
      success: function(res) {
        if (res.confirm) {
          that._runImageImport(0);
        }
      }
    });
  },

  _runImageImport(round) {
    var that = this;
    wx.showLoading({ title: '下载图片 第' + (round + 1) + '批...' });
    wx.cloud.callFunction({
      name: 'importImages',
      data: { action: 'processDefault', offset: 0, limit: 5 }
    }).then(function(res) {
      wx.hideLoading();
      var r = res.result;
      if (r.processed > 0) {
        wx.showModal({
          title: '已下载 ' + r.processed + ' 张图片',
          content: (r.errors.length > 0 ? '错误: ' + r.errors.join(', ') + '\n' : '') + '继续下一批？',
          confirmText: '继续',
          cancelText: '暂停',
          success: function(modal) {
            if (modal.confirm) {
              that._runImageImport(round + 1);
            } else {
              that.onRefreshDbStats();
            }
          }
        });
      } else {
        wx.showToast({ title: '所有图片已下载完成！', icon: 'success' });
        that.onRefreshDbStats();
      }
    }).catch(function(err) {
      wx.hideLoading();
      wx.showModal({
        title: '下载出错',
        content: err.message || '未知错误，请重试',
        confirmText: '重试',
        cancelText: '取消',
        success: function(modal) {
          if (modal.confirm) that._runImageImport(round);
        }
      });
    });
  },

  onImportSets() {
    var that = this;
    wx.showLoading({ title: '下载系列数据...' });
    wx.request({
      url: that._DATA_URLS.sets,
      method: 'GET',
      dataType: 'json',
      timeout: 30000,
      success: function(res) {
        if (res.statusCode !== 200 || !Array.isArray(res.data)) {
          wx.hideLoading();
          wx.showToast({ title: '下载失败', icon: 'none' });
          return;
        }
        wx.showLoading({ title: '写入 ' + res.data.length + ' 个系列...' });
        wx.cloud.callFunction({
          name: 'importCards',
          data: { action: 'writeSets', sets: res.data }
        }).then(function(cfRes) {
          wx.hideLoading();
          wx.showToast({ title: '已导入 ' + cfRes.result.imported + ' 个系列', icon: 'success' });
          that.onRefreshDbStats();
        }).catch(function(err) {
          wx.hideLoading();
          wx.showToast({ title: '写入失败: ' + (err.message || err.errMsg || ''), icon: 'none' });
        });
      },
      fail: function(err) {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // --- Search preferences ---
  onSortPicker() {
    var that = this;
    wx.showActionSheet({
      itemList: this.data.sortOptions,
      success: function(res) {
        that.setData({ sortIndex: res.tapIndex });
        that._saveCurrentSettings();
      }
    });
  },

  onToggleSearchLang() {
    var that = this;
    wx.showActionSheet({
      itemList: this.data.searchLangOptions,
      success: function(res) {
        that.setData({ searchLangIndex: res.tapIndex });
        that._saveCurrentSettings();
      }
    });
  },

  // --- Display preferences ---
  onSetViewMode(e) {
    var mode = e.currentTarget.dataset.mode;
    if (mode && mode !== this.data.viewMode) {
      this.setData({ viewMode: mode });
      this._saveCurrentSettings();
    }
  },

  onToggleViewMode() {
    // no-op, handled by child toggle buttons
  },

  onSetCurrency(e) {
    var currency = e.currentTarget.dataset.currency;
    if (currency && currency !== this.data.currency) {
      this.setData({ currency: currency });
      this._saveCurrentSettings();
    }
  },

  onTogglePriceCurrency() {
    // no-op, handled by child toggle buttons
  },

  // --- Export settings ---
  onToggleExportField(e) {
    var key = e.currentTarget.dataset.key;
    var fields = this.data.exportFields.map(function(f) {
      if (f.key === key) {
        return { key: f.key, label: f.label, checked: !f.checked };
      }
      return f;
    });
    this.setData({ exportFields: fields });
    this._saveCurrentSettings();
  },

  onExportStart() {
    var lists = storageUtil.getLists();
    if (!lists.length) {
      wx.showToast({ title: '暂无收藏列表', icon: 'none' });
      return;
    }
    var exportLists = lists.map(function(list) {
      return {
        id: list.id,
        name: list.name,
        cardCount: list.cards ? list.cards.length : 0,
        selected: true
      };
    });
    this.setData({ showExportModal: true, exportLists: exportLists, exportFormat: 'csv' });
  },

  onToggleExportList(e) {
    var idx = e.currentTarget.dataset.index;
    var key = 'exportLists[' + idx + '].selected';
    this.setData({ [key]: !this.data.exportLists[idx].selected });
  },

  onSetExportFormat(e) {
    this.setData({ exportFormat: e.currentTarget.dataset.format });
  },

  onExportCancel() {
    this.setData({ showExportModal: false });
  },

  onExportConfirm() {
    var that = this;
    var selectedIds = this.data.exportLists.filter(function(l) { return l.selected; }).map(function(l) { return l.id; });
    if (!selectedIds.length) {
      wx.showToast({ title: '请选择至少一个列表', icon: 'none' });
      return;
    }

    var allLists = storageUtil.getLists();
    var lists = allLists.filter(function(l) { return selectedIds.indexOf(l.id) >= 0; });
    var fields = this.data.exportFields.filter(function(f) { return f.checked; });
    var currency = this.data.currency;

    if (this.data.exportFormat === 'text') {
      this._exportAsText(lists, fields, currency);
    } else {
      this._exportAsCSVFile(lists, fields, currency);
    }
    this.setData({ showExportModal: false });
  },

  _exportAsText(lists, fields, currency) {
    var output = '';
    lists.forEach(function(list) {
      output += '【' + list.name + '】\n';
      if (!list.cards || !list.cards.length) {
        output += '（空列表）\n\n';
        return;
      }
      list.cards.forEach(function(cardId) {
        var card = cardData.getCardById(cardId);
        if (!card) return;
        var parts = [];
        fields.forEach(function(f) {
          var val = card[f.key];
          if (val === null || val === undefined) return;
          if (f.key === 'priceMid' || f.key === 'priceLow' || f.key === 'priceMarket') {
            val = (currency === 'CNY' ? '¥' + (val * 7.2).toFixed(0) : '$' + val);
          }
          parts.push(f.label + ': ' + val);
        });
        output += parts.join(' | ') + '\n';
      });
      output += '\n';
    });

    wx.setClipboardData({
      data: output.trim(),
      success: function() {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
      }
    });
  },

  _exportAsCSVFile(lists, fields, currency) {
    // CSV header
    var header = ['列表名称'];
    fields.forEach(function(f) { header.push(f.label); });
    var rows = [header.join(',')];

    lists.forEach(function(list) {
      if (!list.cards || !list.cards.length) return;
      list.cards.forEach(function(cardId) {
        var card = cardData.getCardById(cardId);
        if (!card) return;
        var row = ['"' + list.name + '"'];
        fields.forEach(function(f) {
          var val = card[f.key];
          if (val === null || val === undefined) {
            row.push('');
          } else if (f.key === 'priceMid' || f.key === 'priceLow' || f.key === 'priceMarket') {
            row.push(currency === 'CNY' ? (val * 7.2).toFixed(0) : val);
          } else if (typeof val === 'string' && (val.indexOf(',') >= 0 || val.indexOf('"') >= 0)) {
            row.push('"' + val.replace(/"/g, '""') + '"');
          } else {
            row.push(val);
          }
        });
        rows.push(row.join(','));
      });
    });

    var csv = '\uFEFF' + rows.join('\n'); // BOM for Excel compatibility

    // Save as file for download
    var fs = wx.getFileSystemManager();
    var filePath = wx.env.USER_DATA_PATH + '/planar_bridge_export.csv';
    fs.writeFile({
      filePath: filePath,
      data: csv,
      encoding: 'utf8',
      success: function() {
        wx.shareFileMessage({
          filePath: filePath,
          fileName: 'PlanarBridge收藏导出.csv',
          success: function() {
            wx.showToast({ title: '导出成功', icon: 'success' });
          },
          fail: function() {
            // Fallback: open file
            wx.openDocument({
              filePath: filePath,
              showMenu: true,
              success: function() {},
              fail: function() {
                // Last fallback: copy to clipboard
                wx.setClipboardData({
                  data: csv,
                  success: function() {
                    wx.showToast({ title: 'CSV 已复制到剪贴板', icon: 'success' });
                  }
                });
              }
            });
          }
        });
      },
      fail: function() {
        // Fallback: copy
        wx.setClipboardData({
          data: csv,
          success: function() {
            wx.showToast({ title: 'CSV 已复制到剪贴板', icon: 'success' });
          }
        });
      }
    });
  },

  // --- Data management ---
  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有本地数据吗？这将删除您的收藏列表，但保留设置。',
      confirmText: '确定',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          var settings = wx.getStorageSync('appSettings');
          wx.clearStorageSync();
          if (settings) wx.setStorageSync('appSettings', settings);
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

  onResetSettings() {
    var that = this;
    wx.showModal({
      title: '恢复默认设置',
      content: '确定要将所有偏好设置恢复为默认状态？不会影响收藏数据。',
      confirmText: '确定',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          var defaults = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
          saveSettings(defaults);
          that.setData({
            sortIndex: defaults.sortIndex,
            searchLangIndex: defaults.searchLangIndex,
            viewMode: defaults.viewMode,
            currency: defaults.currency,
            exportFields: defaults.exportFields
          });
          wx.showToast({ title: '已恢复默认', icon: 'success' });
        }
      }
    });
  },

  // --- About ---
  onAbout() {
    wx.showModal({
      title: 'Planar Bridge v1.0.0',
      content: 'AI 驱动的 Flesh and Blood TCG 卡牌搜索与收藏管理工具。\n\n数据来源: TCGPlayer\nAI 引擎: 腾讯混元\n框架: 微信小程序云开发',
      showCancel: false,
      confirmText: '好的'
    });
  },

  onFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有任何建议或问题，请通过以下方式联系我们：\n\n微信公众号: PlanarBridge\n邮箱: feedback@planarbridge.com',
      showCancel: false,
      confirmText: '好的'
    });
  },

  // --- Internal ---
  _saveCurrentSettings() {
    var settings = {
      sortIndex: this.data.sortIndex,
      searchLangIndex: this.data.searchLangIndex,
      viewMode: this.data.viewMode,
      currency: this.data.currency,
      exportFields: this.data.exportFields
    };
    saveSettings(settings);
    // Sync to cloud in background
    storageUtil.syncSettingsToCloud(settings);
  }
});