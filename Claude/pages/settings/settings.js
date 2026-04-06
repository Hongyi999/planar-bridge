var storageUtil = require('../../utils/storage.js');
var cardData = require('../../utils/cardData.js');
var cloudDB = require('../../utils/cloudDB.js');

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
    exportFormat: 'csv',
    imageImportRunning: false,
    imageImportProgress: '',
    priceUpdateRunning: false,
    priceUpdateProgress: '',
    supplementRunning: false,
    supplementProgress: '',
    adminMode: false,
    _adminTapCount: 0
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
    var db = wx.cloud.database();
    var _ = db.command;
    // Count cards
    db.collection('cards').count().then(function(res) {
      that.setData({ dbCardCount: res.total || 0 });
    });
    // Count sets
    db.collection('sets').count().then(function(res) {
      that.setData({ dbSetCount: res.total || 0 });
    });
    // Count cards with cloud images
    db.collection('cards').where({ cloudImageId: _.neq('') }).count().then(function(res) {
      that.setData({ dbImageCount: res.total || 0 });
    });
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
          content: '共 ' + allCards.length + ' 张卡牌。将分批写入数据库。',
          confirmText: '开始写入',
          success: function(modal) {
            if (modal.confirm) {
              that._allCardsCache = allCards;
              that._writeCardBatch(0, 5);
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

  // Strip raw card to essential fields only (reduce payload size)
  _slimCard(card) {
    var printings = (card.printings || []).map(function(p) {
      return {
        unique_id: p.unique_id || '',
        id: p.id || '',
        set_id: p.set_id || '',
        edition: p.edition || '',
        rarity: p.rarity || '',
        foiling: p.foiling || '',
        image_url: p.image_url || '',
        tcgplayer_product_id: p.tcgplayer_product_id || '',
        tcgplayer_url: p.tcgplayer_url || '',
        artists: p.artists || []
      };
    });
    return {
      unique_id: card.unique_id,
      name: card.name,
      color: card.color || '',
      pitch: card.pitch || '',
      cost: card.cost || '',
      power: card.power || '',
      defense: card.defense || '',
      health: card.health || '',
      intelligence: card.intelligence || '',
      types: card.types || [],
      card_keywords: card.card_keywords || [],
      functional_text_plain: card.functional_text_plain || '',
      functional_text: card.functional_text || '',
      type_text: card.type_text || '',
      played_horizontally: card.played_horizontally || false,
      blitz_legal: card.blitz_legal || false,
      cc_legal: card.cc_legal || false,
      commoner_legal: card.commoner_legal || false,
      traits: card.traits || [],
      printings: printings
    };
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

    // Slim down data to fit cloud function payload limit (~100KB)
    var slimBatch = batch.map(function(c) { return that._slimCard(c); });

    wx.showLoading({ title: '写入 ' + offset + '/' + allCards.length + '...' });
    wx.cloud.callFunction({
      name: 'importCards',
      data: { action: 'writeCards', cards: slimBatch }
    }).then(function(res) {
      wx.hideLoading();
      var r = res.result;
      // Check if cloud function returned an error
      if (!r || !r.success) {
        wx.showModal({
          title: '写入失败',
          content: '云函数返回错误: ' + (r ? (r.error || JSON.stringify(r.errors || [])) : '无响应') + '\noffset=' + offset,
          confirmText: '重试',
          cancelText: '取消',
          success: function(modal) {
            if (modal.confirm) that._writeCardBatch(offset, batchSize);
            else { that._allCardsCache = null; that.onRefreshDbStats(); }
          }
        });
        return;
      }
      var errCount = (r.errors && r.errors.length) || 0;
      var nextOffset = offset + batchSize;
      // Show errors if any
      if (errCount > 0) {
        console.error('Batch errors:', r.errors.slice(0, 3));
      }
      if (nextOffset < allCards.length) {
        // Update progress with error info
        wx.showLoading({ title: '写入 ' + nextOffset + '/' + allCards.length + (errCount > 0 ? ' (错误:' + errCount + ')' : '') });
        // Small delay to avoid overwhelming cloud function
        setTimeout(function() {
          that._writeCardBatch(nextOffset, batchSize);
        }, 200);
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
      content: '将自动批量下载官方卡图到微信云存储（每批10张，自动连续执行）。过程中可随时点击"暂停"。是否开始？',
      confirmText: '开始下载',
      success: function(res) {
        if (res.confirm) {
          that._imageImportPaused = false;
          that._imageImportTotal = 0;
          that._imageImportErrors = 0;
          that.setData({ imageImportRunning: true, imageImportProgress: '准备中...' });
          that._runImageImport(0);
        }
      }
    });
  },

  onPauseImageImport() {
    this._imageImportPaused = true;
    this.setData({ imageImportRunning: false, imageImportProgress: '已暂停，共下载 ' + this._imageImportTotal + ' 张' });
    this.onRefreshDbStats();
  },

  _runImageImport(round) {
    if (this._imageImportPaused) return;
    var that = this;
    var batchSize = 5;
    var db = wx.cloud.database();
    var _ = db.command;

    that.setData({ imageImportProgress: '第' + (round + 1) + '批 查询中... 已完成 ' + that._imageImportTotal + ' 张' });

    // Step 1: Query cards that need images (client-side DB query)
    db.collection('cards')
      .where({ imageUrl: _.neq(''), cloudImageId: _.eq('') })
      .limit(batchSize)
      .field({ _id: true, name: true, imageUrl: true, setCode: true })
      .get()
      .then(function(res) {
        var cards = res.data;
        if (cards.length === 0) {
          that.setData({ imageImportRunning: false, imageImportProgress: '全部完成！共 ' + that._imageImportTotal + ' 张' });
          wx.showToast({ title: '图片下载完成！', icon: 'success' });
          that.onRefreshDbStats();
          return;
        }

        that.setData({ imageImportProgress: '第' + (round + 1) + '批 下载中(' + cards.length + '张)... 已完成 ' + that._imageImportTotal + ' 张' });

        // Step 2: Process each card sequentially
        that._processImageQueue(cards, 0, round);
      })
      .catch(function(err) {
        that._imageImportErrors++;
        that.setData({ imageImportProgress: '查询出错: ' + (err.message || '未知错误') + '，3秒后重试...' });
        setTimeout(function() {
          if (!that._imageImportPaused) that._runImageImport(round);
        }, 3000);
      });
  },

  _processImageQueue(cards, index, round) {
    if (this._imageImportPaused) return;
    if (index >= cards.length) {
      // Batch done, continue next batch
      this._runImageImport(round + 1);
      return;
    }

    var that = this;
    var card = cards[index];
    var ext = '.png';
    var match = (card.imageUrl || '').match(/\.(\w+)(?:\?|$)/);
    if (match) ext = '.' + match[1];
    var cloudPath = 'cards/' + (card.setCode || 'unknown') + '/' + card._id + ext;

    // Download image to temp file
    wx.downloadFile({
      url: card.imageUrl,
      timeout: 20000,
      success: function(dlRes) {
        if (dlRes.statusCode !== 200) {
          console.error('Download failed for ' + card.name + ': HTTP ' + dlRes.statusCode);
          that._imageImportErrors++;
          that._processImageQueue(cards, index + 1, round);
          return;
        }
        // Upload to cloud storage
        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: dlRes.tempFilePath,
          success: function(upRes) {
            // Update DB record via cloud function (client has no write permission)
            wx.cloud.callFunction({
              name: 'importCards',
              data: { action: 'updateCardImage', cardId: card._id, cloudImageId: upRes.fileID }
            }).then(function(cfRes) {
              if (cfRes.result && cfRes.result.success) {
                that._imageImportTotal++;
                that.setData({ imageImportProgress: '第' + (round + 1) + '批 ' + (index + 1) + '/' + cards.length + ' ' + card.name + ' ✓ 共 ' + that._imageImportTotal + ' 张' });
              } else {
                console.error('DB update failed for ' + card.name + ': ' + (cfRes.result && cfRes.result.error || 'unknown'));
                that._imageImportErrors++;
              }
              that._processImageQueue(cards, index + 1, round);
            }).catch(function(err) {
              console.error('DB update failed for ' + card.name + ': ' + err.message);
              that._imageImportErrors++;
              that._processImageQueue(cards, index + 1, round);
            });
          },
          fail: function(err) {
            console.error('Upload failed for ' + card.name + ': ' + (err.errMsg || err.message));
            that._imageImportErrors++;
            that._processImageQueue(cards, index + 1, round);
          }
        });
      },
      fail: function(err) {
        console.error('Download failed for ' + card.name + ': ' + (err.errMsg || err.message));
        that._imageImportErrors++;
        that._processImageQueue(cards, index + 1, round);
      }
    });
  },

  // --- Price Sync (JustTCG) ---
  _JUSTTCG_KEY: 'tcg_28fccf805c324d6bb7a3247c95ec39aa',
  _JUSTTCG_BASE: 'https://api.justtcg.com/functions/v1',

  // Price update tiers by rarity
  _PRICE_TIERS: {
    daily: ['Fabled', 'Legendary'],
    weekly: ['Majestic', 'Super Rare', 'Promo'],
    monthly: ['Rare', 'Common', 'Token']
  },

  onSyncPrices() {
    var that = this;
    wx.showModal({
      title: '同步卡牌价格',
      content: '将从 JustTCG 获取卡牌市场价格并更新数据库。按稀有度分级更新。是否开始？',
      confirmText: '开始同步',
      success: function(res) {
        if (res.confirm) {
          that._priceUpdatePaused = false;
          that._priceUpdateTotal = 0;
          that._priceUpdateErrors = 0;
          that._priceUpdateSkipped = 0;
          that._priceUpdateNoId = 0;
          that.setData({ priceUpdateRunning: true, priceUpdateProgress: '查询需要更新的卡牌...' });
          that._fetchCardsForPriceUpdate();
        }
      }
    });
  },

  onPausePriceUpdate() {
    this._priceUpdatePaused = true;
    this.setData({ priceUpdateRunning: false, priceUpdateProgress: '已暂停，共更新 ' + this._priceUpdateTotal + ' 张' });
  },

  _fetchCardsForPriceUpdate() {
    var that = this;

    that._priceCardQueue = [];
    that._priceBatchIndex = 0;

    that.setData({ priceUpdateProgress: '查询高价值卡牌...' });
    that._loadPriceCardsForRarities(that._PRICE_TIERS.daily, 0, function() {
      that.setData({ priceUpdateProgress: '查询中等价值卡牌...' });
      that._loadPriceCardsForRarities(that._PRICE_TIERS.weekly, 7, function() {
        that.setData({ priceUpdateProgress: '查询普通卡牌...' });
        that._loadPriceCardsForRarities(that._PRICE_TIERS.monthly, 30, function() {
          var total = that._priceCardQueue.length;
          if (total === 0) {
            that.setData({ priceUpdateRunning: false, priceUpdateProgress: '所有价格已是最新' + (that._priceUpdateNoId > 0 ? '（' + that._priceUpdateNoId + ' 张无产品ID）' : '') });
            wx.showToast({ title: '无需更新', icon: 'success' });
            return;
          }
          // Group into batches of 20 (free tier limit)
          that._priceBatches = [];
          that._priceBatchesDone = 0;
          for (var i = 0; i < total; i += 20) {
            that._priceBatches.push(that._priceCardQueue.slice(i, i + 20));
          }
          that.setData({ priceUpdateProgress: '共 ' + total + ' 张卡，' + that._priceBatches.length + ' 批（每天最多90批），开始获取...' });
          that._processPriceBatch();
        });
      });
    });
  },

  _loadPriceCardsForRarities(rarities, skipDays, callback) {
    var that = this;
    var db = wx.cloud.database();
    var _ = db.command;
    var cutoff = skipDays > 0 ? new Date(Date.now() - skipDays * 86400000) : null;

    function loadBatch(skip) {
      db.collection('cards').where({
        rarity: _.in(rarities)
      }).skip(skip).limit(20).field({
        _id: true, name: true, rarity: true, printings: true, priceUpdatedAt: true
      }).get().then(function(res) {
        var cards = res.data;
        if (cards.length === 0) { callback(); return; }
        cards.forEach(function(card) {
          if (cutoff && card.priceUpdatedAt && new Date(card.priceUpdatedAt) > cutoff) {
            that._priceUpdateSkipped++;
            return;
          }
          var productId = '';
          if (card.printings && card.printings.length > 0) {
            for (var i = 0; i < card.printings.length; i++) {
              if (card.printings[i].tcgplayerProductId) {
                productId = card.printings[i].tcgplayerProductId;
                break;
              }
            }
          }
          if (productId) {
            that._priceCardQueue.push({
              cardId: card._id,
              name: card.name,
              rarity: card.rarity,
              productId: String(productId)
            });
          } else {
            that._priceUpdateNoId++;
          }
        });
        loadBatch(skip + 20);
      }).catch(function(err) {
        console.error('Load price cards error:', err);
        callback();
      });
    }
    loadBatch(0);
  },

  _processPriceBatch() {
    if (this._priceUpdatePaused) return;
    var that = this;
    var batches = that._priceBatches;
    var bIdx = that._priceBatchIndex;

    // Daily limit: stop at 90 batches to stay under 100/day
    if (that._priceBatchesDone >= 90) {
      that.setData({
        priceUpdateRunning: false,
        priceUpdateProgress: '今日额度已用完（90批/天）。已更新 ' + that._priceUpdateTotal + ' 张，明天继续剩余 ' + (batches.length - bIdx) + ' 批'
      });
      wx.showToast({ title: '明天继续', icon: 'none' });
      return;
    }

    if (bIdx >= batches.length) {
      that.setData({
        priceUpdateRunning: false,
        priceUpdateProgress: '完成！更新 ' + that._priceUpdateTotal + ' 张' +
          (that._priceUpdateErrors > 0 ? '，' + that._priceUpdateErrors + ' 个错误' : '') +
          (that._priceUpdateSkipped > 0 ? '，跳过 ' + that._priceUpdateSkipped + ' 张' : '') +
          (that._priceUpdateNoId > 0 ? '，' + that._priceUpdateNoId + ' 张无产品ID' : '')
      });
      wx.showToast({ title: '价格同步完成', icon: 'success' });
      return;
    }

    var batch = batches[bIdx];
    that.setData({
      priceUpdateProgress: '批次 ' + (bIdx + 1) + '/' + batches.length + ' (' + batch.length + '张) 已更新 ' + that._priceUpdateTotal + ' 张'
    });

    // Build POST body for JustTCG batch query
    var postBody = batch.map(function(card) {
      return { tcgplayerId: card.productId };
    });

    wx.request({
      url: that._JUSTTCG_BASE + '/cards',
      method: 'POST',
      header: {
        'x-api-key': that._JUSTTCG_KEY,
        'Content-Type': 'application/json'
      },
      data: postBody,
      timeout: 15000,
      success: function(res) {
        if (res.statusCode === 429) {
          console.warn('Rate limited, waiting 60s before retry...');
          that.setData({ priceUpdateProgress: '频率限制，等待60秒后重试... 已更新 ' + that._priceUpdateTotal + ' 张' });
          setTimeout(function() { that._processPriceBatch(); }, 60000);
          return;
        }
        if (res.statusCode !== 200 || !res.data) {
          console.error('JustTCG API error: HTTP ' + res.statusCode, res.data);
          that._priceUpdateErrors += batch.length;
          that._priceBatchIndex++;
          that._priceBatchesDone++;
          setTimeout(function() { that._processPriceBatch(); }, 7000);
          return;
        }

        // Log first response for debugging
        if (bIdx === 0) {
          console.log('JustTCG response sample:', JSON.stringify(res.data).substring(0, 500));
        }

        // Parse response and build price updates
        var priceUpdates = that._parseJustTcgResponse(res.data, batch);

        if (priceUpdates.length === 0) {
          that._priceUpdateErrors += batch.length;
          that._priceBatchIndex++;
          that._processPriceBatch();
          return;
        }

        // Write prices to DB via cloud function
        wx.cloud.callFunction({
          name: 'importCards',
          data: { action: 'updateCardPrices', prices: priceUpdates }
        }).then(function(cfRes) {
          if (cfRes.result && cfRes.result.success) {
            that._priceUpdateTotal += cfRes.result.updated || 0;
            that._priceUpdateErrors += (cfRes.result.errors || []).length;
          } else {
            that._priceUpdateErrors += priceUpdates.length;
          }
          that._priceBatchIndex++;
          that._priceBatchesDone++;
          // Rate limit: free tier = 10 req/min, wait 7s between batches
          setTimeout(function() { that._processPriceBatch(); }, 7000);
        }).catch(function(err) {
          console.error('Price DB update error:', err);
          that._priceUpdateErrors += priceUpdates.length;
          that._priceBatchIndex++;
          that._priceBatchesDone++;
          setTimeout(function() { that._processPriceBatch(); }, 7000);
        });
      },
      fail: function(err) {
        console.error('JustTCG API failed:', err);
        that._priceUpdateErrors += batch.length;
        that._priceBatchIndex++;
        setTimeout(function() { that._processPriceBatch(); }, 3000);
      }
    });
  },

  _parseJustTcgResponse(data, batch) {
    var results = [];
    try {
      // JustTCG response: { data: [{ tcgplayerId, name, variants: [{ condition, printing, marketPrice, lowPrice, midPrice, ... }] }] }
      var items = data.data || (Array.isArray(data) ? data : []);

      // Build map from tcgplayerId to card info
      var cardMap = {};
      batch.forEach(function(card) {
        cardMap[String(card.productId)] = card;
      });

      items.forEach(function(item) {
        var tcgId = String(item.tcgplayerId || '');
        var card = cardMap[tcgId];
        if (!card) return;

        // Find best variant: prefer "Near Mint" + "Normal" printing
        var variants = item.variants || [];
        if (variants.length === 0) return;

        var best = null;
        // Priority 1: Near Mint Normal
        for (var i = 0; i < variants.length; i++) {
          var v = variants[i];
          if (v.condition === 'Near Mint' && (v.printing === 'Normal' || v.printing === 'Unlimited')) {
            best = v; break;
          }
        }
        // Priority 2: any Near Mint
        if (!best) {
          for (var i = 0; i < variants.length; i++) {
            if (variants[i].condition === 'Near Mint') { best = variants[i]; break; }
          }
        }
        // Priority 3: first variant
        if (!best) best = variants[0];

        // Log first item's variant for debugging
        if (results.length === 0) {
          console.log('JustTCG variant sample:', JSON.stringify(best).substring(0, 500));
        }

        // Extract prices from variant - try various field names
        var market = best.marketPrice || best.market_price || best.price || null;
        var low = best.lowPrice || best.low_price || null;
        var mid = best.midPrice || best.mid_price || null;
        var trend = best.directLowPrice || best.direct_low_price || null;

        if (market !== null || low !== null || mid !== null) {
          results.push({
            cardId: card.cardId,
            priceLow: low,
            priceMid: mid,
            priceMarket: market,
            priceTrend: trend
          });
        }
      });
    } catch (e) {
      console.error('Parse JustTCG response error:', e);
    }
    return results;
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

  // --- Supplement missing cards from JustTCG ---
  onSupplementCards() {
    var that = this;
    if (this.data.supplementRunning) return;

    wx.showModal({
      title: '补充缺失卡牌',
      content: '从 JustTCG 拉取 FAB 全部卡牌列表，补充数据库中缺失的卡牌（含价格）。这会消耗 API 请求配额。',
      confirmText: '开始',
      success: function(res) {
        if (!res.confirm) return;
        that.setData({ supplementRunning: true, supplementProgress: '正在获取游戏列表...' });
        that._supplementFindGameId();
      }
    });
  },

  onPauseSupplement() {
    this._supplementPaused = true;
    this.setData({ supplementRunning: false, supplementProgress: '已暂停 · ' + this.data.supplementProgress });
  },

  _supplementFindGameId() {
    var that = this;
    // Try fetching games to find FAB game ID
    wx.request({
      url: that._JUSTTCG_BASE + '/games',
      method: 'GET',
      header: { 'x-api-key': that._JUSTTCG_KEY },
      success: function(res) {
        if (res.statusCode !== 200 || !res.data || !res.data.data) {
          that.setData({ supplementRunning: false, supplementProgress: '获取游戏列表失败' });
          return;
        }
        var games = res.data.data;
        var fabGame = null;
        for (var i = 0; i < games.length; i++) {
          var g = games[i];
          var name = (g.name || '').toLowerCase();
          if (name.indexOf('flesh') >= 0 || name.indexOf('fab') >= 0) {
            fabGame = g;
            break;
          }
        }
        if (!fabGame) {
          that.setData({ supplementRunning: false, supplementProgress: '未找到 FAB 游戏' });
          console.log('Available games:', JSON.stringify(games.map(function(g) { return g.id + ':' + g.name; })));
          return;
        }
        console.log('Found FAB game:', fabGame.id, fabGame.name, 'cards_count:', fabGame.cards_count);
        that._fabGameId = fabGame.id;
        that._supplementTotal = fabGame.cards_count || 0;
        that._supplementWritten = 0;
        that._supplementSkipped = 0;
        that._supplementOffset = 0;
        that._supplementPaused = false;
        that.setData({ supplementProgress: '找到 ' + fabGame.name + '（' + that._supplementTotal + ' 张卡）' });
        // Start fetching cards
        setTimeout(function() { that._supplementFetchBatch(); }, 1000);
      },
      fail: function() {
        that.setData({ supplementRunning: false, supplementProgress: '网络错误' });
      }
    });
  },

  _supplementFetchBatch() {
    var that = this;
    if (this._supplementPaused) return;

    var limit = 20; // Free tier safe batch size
    var offset = this._supplementOffset;

    that.setData({
      supplementProgress: '拉取卡牌 ' + offset + '/' + that._supplementTotal + ' · 新增 ' + that._supplementWritten + ' 张'
    });

    wx.request({
      url: that._JUSTTCG_BASE + '/cards',
      method: 'GET',
      header: { 'x-api-key': that._JUSTTCG_KEY },
      data: { game: that._fabGameId, limit: limit, offset: offset },
      timeout: 15000,
      success: function(res) {
        if (res.statusCode === 429) {
          that.setData({ supplementProgress: '频率限制，等待 60 秒... 已新增 ' + that._supplementWritten + ' 张' });
          setTimeout(function() { that._supplementFetchBatch(); }, 60000);
          return;
        }
        if (res.statusCode !== 200 || !res.data || !res.data.data) {
          that.setData({ supplementRunning: false, supplementProgress: 'API 错误 HTTP ' + res.statusCode });
          return;
        }

        var cards = res.data.data;
        if (cards.length === 0) {
          // Done
          that.setData({
            supplementRunning: false,
            supplementProgress: '完成！新增 ' + that._supplementWritten + ' 张，跳过 ' + that._supplementSkipped + ' 张'
          });
          that.onRefreshDbStats();
          return;
        }

        // Send to cloud function to write missing cards
        wx.cloud.callFunction({
          name: 'importCards',
          data: { action: 'writeJustTcgCards', cards: cards }
        }).then(function(cfRes) {
          var r = cfRes.result || {};
          that._supplementWritten += (r.written || 0);
          that._supplementSkipped += (r.skipped || 0);
          that._supplementOffset += cards.length;

          var hasMore = res.data.meta && res.data.meta.hasMore;
          if (hasMore && !that._supplementPaused) {
            // Rate limit: wait 7 seconds between batches
            setTimeout(function() { that._supplementFetchBatch(); }, 7000);
          } else {
            that.setData({
              supplementRunning: false,
              supplementProgress: '完成！新增 ' + that._supplementWritten + ' 张，跳过 ' + that._supplementSkipped + ' 张'
            });
            that.onRefreshDbStats();
          }
        }).catch(function(err) {
          console.error('Supplement write error:', err);
          that._supplementOffset += cards.length;
          setTimeout(function() { that._supplementFetchBatch(); }, 7000);
        });
      },
      fail: function() {
        that.setData({ supplementProgress: '网络错误，10 秒后重试...' });
        setTimeout(function() { that._supplementFetchBatch(); }, 10000);
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

  onExportNoop() {
    // Prevent tap from bubbling to mask
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
    var format = this.data.exportFormat;

    this.setData({ showExportModal: false });
    wx.showLoading({ title: '正在导出...' });

    // Collect all unique card IDs
    var allCardIds = [];
    lists.forEach(function(list) {
      (list.cards || []).forEach(function(id) {
        if (allCardIds.indexOf(id) < 0) allCardIds.push(id);
      });
    });

    if (allCardIds.length === 0) {
      wx.hideLoading();
      if (format === 'text') {
        var emptyOutput = lists.map(function(l) { return '## ' + l.name + '\n（空列表）'; }).join('\n\n');
        wx.setClipboardData({
          data: emptyOutput,
          success: function() { wx.showToast({ title: '已复制到剪贴板', icon: 'success' }); }
        });
      } else {
        wx.showToast({ title: '没有卡牌数据可导出', icon: 'none' });
      }
      return;
    }

    // Fetch all card data from cloud (fallback to local)
    var promises = allCardIds.map(function(id) {
      return cloudDB.getCardById(id).then(function(c) {
        return c || cardData.getCardById(id);
      }).catch(function() {
        return cardData.getCardById(id);
      });
    });

    Promise.all(promises).then(function(cards) {
      var cardMap = {};
      cards.forEach(function(c) {
        if (c) cardMap[c._id || c.id] = c;
      });
      wx.hideLoading();

      if (format === 'text') {
        that._exportAsText(lists, fields, currency, cardMap);
      } else {
        that._exportAsCSVFile(lists, fields, currency, cardMap);
      }
    }).catch(function() {
      wx.hideLoading();
      wx.showToast({ title: '导出失败，请重试', icon: 'none' });
    });
  },

  _exportAsText(lists, fields, currency, cardMap) {
    var output = '# Planar Bridge 收藏导出\n\n';
    lists.forEach(function(list) {
      output += '## ' + list.name + '\n\n';
      if (!list.cards || !list.cards.length) {
        output += '（空列表）\n\n';
        return;
      }
      output += '| ' + fields.map(function(f) { return f.label; }).join(' | ') + ' |\n';
      output += '| ' + fields.map(function() { return '---'; }).join(' | ') + ' |\n';
      list.cards.forEach(function(cardId) {
        var card = cardMap[cardId];
        if (!card) return;
        var cells = fields.map(function(f) {
          var val = card[f.key];
          if (val === null || val === undefined) return '—';
          if (f.key === 'priceMid' || f.key === 'priceLow' || f.key === 'priceMarket') {
            return currency === 'CNY' ? '¥' + (val * 7.2).toFixed(0) : '$' + val;
          }
          return String(val).replace(/\|/g, '\\|').replace(/\n/g, ' ');
        });
        output += '| ' + cells.join(' | ') + ' |\n';
      });
      output += '\n';
    });

    wx.setClipboardData({
      data: output.trim(),
      success: function() {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
      },
      fail: function() {
        wx.showToast({ title: '复制失败', icon: 'none' });
      }
    });
  },

  _exportAsCSVFile(lists, fields, currency, cardMap) {
    // Build HTML table that Excel/WPS can open as .xls
    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>收藏导出</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
    html += '<body><table border="1">';

    // Header row
    html += '<tr><th style="background:#f0f0f0;font-weight:bold;">列表名称</th>';
    fields.forEach(function(f) {
      html += '<th style="background:#f0f0f0;font-weight:bold;">' + f.label + '</th>';
    });
    html += '</tr>';

    // Data rows
    lists.forEach(function(list) {
      if (!list.cards || !list.cards.length) return;
      list.cards.forEach(function(cardId) {
        var card = cardMap[cardId];
        if (!card) return;
        html += '<tr><td>' + list.name + '</td>';
        fields.forEach(function(f) {
          var val = card[f.key];
          if (val === null || val === undefined) {
            html += '<td></td>';
          } else if (f.key === 'priceMid' || f.key === 'priceLow' || f.key === 'priceMarket') {
            html += '<td>' + (currency === 'CNY' ? (val * 7.2).toFixed(0) : val) + '</td>';
          } else {
            var str = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += '<td>' + str + '</td>';
          }
        });
        html += '</tr>';
      });
    });

    html += '</table></body></html>';

    // Write as .xls and open with document viewer
    var fs = wx.getFileSystemManager();
    var filePath = wx.env.USER_DATA_PATH + '/PlanarBridge_export.xls';
    fs.writeFile({
      filePath: filePath,
      data: html,
      encoding: 'utf8',
      success: function() {
        wx.openDocument({
          filePath: filePath,
          showMenu: true,
          fileType: 'xls',
          success: function() {},
          fail: function(err) {
            console.error('openDocument fail:', err);
            // Fallback: try shareFileMessage
            wx.shareFileMessage({
              filePath: filePath,
              fileName: 'PlanarBridge_export.xls',
              success: function() {},
              fail: function() {
                wx.showToast({ title: '导出失败，请重试', icon: 'none' });
              }
            });
          }
        });
      },
      fail: function(err) {
        console.error('writeFile fail:', err);
        wx.showToast({ title: '文件写入失败', icon: 'none' });
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
    var that = this;
    var count = this.data._adminTapCount + 1;
    if (count >= 5 && !this.data.adminMode) {
      this.setData({ adminMode: true, _adminTapCount: 0 });
      wx.showToast({ title: '已开启管理模式', icon: 'none' });
      return;
    }
    this.setData({ _adminTapCount: count });
    // Reset tap counter after 3 seconds
    if (this._adminTimer) clearTimeout(this._adminTimer);
    this._adminTimer = setTimeout(function() {
      that.setData({ _adminTapCount: 0 });
    }, 3000);
    if (count === 1) {
      wx.showModal({
        title: 'Planar Bridge v1.0.0',
        content: 'AI 驱动的 Flesh and Blood TCG 卡牌搜索与收藏管理工具。\n\n数据来源: TCGPlayer\nAI 引擎: 腾讯混元\n框架: 微信小程序云开发',
        showCancel: false,
        confirmText: '好的'
      });
    }
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