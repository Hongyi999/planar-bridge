var cardData = require('../../utils/cardData.js');
var aiParser = require('../../utils/aiParser.js');
var storageUtil = require('../../utils/storage.js');

// Sort options mapping
var SORT_MAP = [
  { field: 'name', order: 'asc' },         // 0: 名称 A-Z
  { field: 'name', order: 'desc' },        // 1: 名称 Z-A
  { field: 'setCode', order: 'asc' },      // 2: 系列
  { field: 'priceMid', order: 'desc' },    // 3: 价格从高到低
  { field: 'priceMid', order: 'asc' }      // 4: 价格从低到高
];

function getSortPreference() {
  var settings = wx.getStorageSync('appSettings');
  var idx = (settings && settings.sortIndex) || 0;
  return SORT_MAP[idx] || SORT_MAP[0];
}

function sortResults(results, sortPref) {
  return results.slice().sort(function(a, b) {
    var field = sortPref.field;
    var asc = sortPref.order === 'asc' ? 1 : -1;
    var aVal = a[field];
    var bVal = b[field];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'string') return aVal.localeCompare(bVal) * asc;
    return (aVal - bVal) * asc;
  });
}

Page({
  data: {
    statusBarHeight: 20,
    navTop: 0,
    navHeight: 32,
    navFullHeight: 64,
    query: '',
    filters: {},
    thinkingSteps: [],
    summary: '',
    resultCount: 0,
    results: [],
    showResults: false,
    isLoading: false,
    viewMode: 'grid',
    headerHeight: 200
  },

  onLoad: function(options) {
    var that = this;
    var sysInfo = wx.getSystemInfoSync();
    var menuBtn = wx.getMenuButtonBoundingClientRect();
    var query = decodeURIComponent(options.query || '');
    var sortPref = getSortPreference();

    // Show thinking steps immediately
    var localFilters = aiParser.parseQuery(query);
    var steps = aiParser.getThinkingSteps(query, localFilters);

    that.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20,
      navTop: menuBtn.top,
      navHeight: menuBtn.height,
      navFullHeight: menuBtn.bottom + 8,
      query: query,
      thinkingSteps: steps,
      isLoading: true
    });

    // Try cloud AI search first, fallback to local
    aiParser.aiSearch(query, sortPref.field, sortPref.order).then(function(result) {
      var results = result.results || [];
      // Apply local price filters as safety net
      if (localFilters.priceMin || localFilters.priceMax) {
        results = results.filter(function(card) {
          if (localFilters.priceMin && card.priceMid < localFilters.priceMin) return false;
          if (localFilters.priceMax && card.priceMid > localFilters.priceMax) return false;
          return true;
        });
      }
      results = sortResults(results, sortPref);
      that._markFavorites(results);
      that.setData({
        filters: result.filters || localFilters,
        summary: result.summary || '',
        resultCount: results.length,
        results: results,
        isLoading: false
      });
      that._measureHeader();
    }).catch(function() {
      // Fallback to local search
      var filters = aiParser.parseQuery(query);
      var results = cardData.searchCards(filters);
      results = sortResults(results, sortPref);
      that._markFavorites(results);
      var summary = aiParser.generateSummary(query, results);

      that.setData({
        filters: filters,
        summary: summary,
        resultCount: results.length,
        results: results,
        isLoading: false
      });
      that._measureHeader();
    });
  },

  onThinkingComplete: function() {
    this.setData({ showResults: true });
    this._measureHeader();
  },

  _measureHeader: function() {
    var that = this;
    setTimeout(function() {
      var query = wx.createSelectorQuery();
      query.select('.results-fixed-header').boundingClientRect(function(rect) {
        if (rect) {
          that.setData({ headerHeight: rect.bottom });
        }
      }).exec();
    }, 100);
  },

  onSearch: function(e) {
    var query = e.detail.value;
    if (query && query.trim()) {
      wx.redirectTo({
        url: '/pages/results/results?query=' + encodeURIComponent(query.trim())
      });
    }
  },

  goBack: function() {
    wx.navigateBack();
  },

  goHome: function() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  onImgLoad: function(e) {
    var index = e.currentTarget.dataset.index;
    var key = 'results[' + index + ']._imgLoaded';
    var update = {};
    update[key] = true;
    this.setData(update);
  },

  onImgError: function(e) {
    var index = e.currentTarget.dataset.index;
    var update = {};
    update['results[' + index + ']._imgLoaded'] = true;
    update['results[' + index + ']._imgFailed'] = true;
    this.setData(update);
  },

  onToggleView: function() {
    this.setData({ viewMode: this.data.viewMode === 'grid' ? 'list' : 'grid' });
  },

  onCardTap: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  },

  onStarTap: function(e) {
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var isFav = storageUtil.toggleFavorite(id);
    var key = 'results[' + index + ']._isFav';
    var update = {};
    update[key] = isFav;
    this.setData(update);
    wx.showToast({ title: isFav ? '已收藏' : '已取消收藏', icon: 'none', duration: 1000 });
  },

  _markFavorites: function(results) {
    results.forEach(function(card) {
      var cardId = card.id || card._id;
      card._isFav = storageUtil.isCardFavorited(cardId);
    });
    return results;
  }
});