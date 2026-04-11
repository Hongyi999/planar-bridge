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
    isLoadingMore: false,
    hasMore: true,
    page: 1,
    viewMode: 'grid',
    headerHeight: 200,
    collapsed: false
  },

  _favSet: null,
  _sortPref: null,
  _localFilters: null,

  onLoad: function(options) {
    var that = this;
    var sysInfo = wx.getSystemInfoSync();
    var menuBtn = wx.getMenuButtonBoundingClientRect();
    var query = decodeURIComponent(options.query || '');
    var sortPref = getSortPreference();

    // Cache sort pref and local filters for pagination
    that._sortPref = sortPref;
    that._localFilters = aiParser.parseQuery(query);

    // Build favorites set once for O(1) lookups
    that._favSet = {};
    var lists = storageUtil.getLists();
    lists.forEach(function(list) {
      list.cards.forEach(function(id) { that._favSet[id] = true; });
    });

    // Show thinking steps immediately
    var steps = aiParser.getThinkingSteps(query, that._localFilters);

    that.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20,
      navTop: menuBtn.top,
      navHeight: menuBtn.height,
      navFullHeight: menuBtn.bottom + 8,
      query: query,
      thinkingSteps: steps,
      isLoading: true
    });

    that._loadPage(1);
  },

  _loadPage: function(page) {
    var that = this;
    var isFirst = page === 1;

    if (!isFirst && (!that.data.hasMore || that.data.isLoadingMore)) return;
    if (!isFirst) that.setData({ isLoadingMore: true });

    var sortPref = that._sortPref;

    aiParser.aiSearch(that.data.query, sortPref.field, sortPref.order, null, page).then(function(result) {
      var results = result.results || [];
      // Apply local price filters as safety net
      var lf = that._localFilters;
      if (lf.priceMin || lf.priceMax) {
        results = results.filter(function(card) {
          if (lf.priceMin && card.priceMid < lf.priceMin) return false;
          if (lf.priceMax && card.priceMid > lf.priceMax) return false;
          return true;
        });
      }
      results = sortResults(results, sortPref);
      that._markFavorites(results);

      var allResults = isFirst ? results : that.data.results.concat(results);
      var update = {
        results: allResults,
        page: page,
        hasMore: result.hasMore !== false,
        isLoadingMore: false
      };
      if (isFirst) {
        var serverCount = (typeof result.resultCount === 'number') ? result.resultCount : allResults.length;
        // Always regenerate summary locally with the real total count to avoid
        // any server-side summary mismatch (e.g. stale fallback using page size).
        var clientSummary = aiParser.generateSummary(that.data.query, allResults, serverCount);
        update.filters = result.filters || lf;
        update.summary = clientSummary;
        update.resultCount = serverCount;
        update.isLoading = false;
      }
      that.setData(update);
      if (isFirst) that._measureHeader();
    }).catch(function() {
      if (!isFirst) {
        that.setData({ isLoadingMore: false });
        return;
      }
      // Fallback to local search (first page only)
      var filters = that._localFilters;
      var results = cardData.searchCards(filters);
      results = sortResults(results, sortPref);
      that._markFavorites(results);
      var summary = aiParser.generateSummary(that.data.query, results);

      that.setData({
        filters: filters,
        summary: summary,
        resultCount: results.length,
        results: results,
        isLoading: false,
        hasMore: false
      });
      that._measureHeader();
    });
  },

  onScrollToLower: function() {
    if (this.data.hasMore && !this.data.isLoadingMore && !this.data.isLoading) {
      this._loadPage(this.data.page + 1);
    }
  },

  onScroll: function(e) {
    var top = e.detail.scrollTop;
    var shouldCollapse = top > 40;
    if (shouldCollapse !== this.data.collapsed) {
      var update = { collapsed: shouldCollapse };
      var targetH = shouldCollapse ? this._collapsedHeaderHeight : this._fullHeaderHeight;
      if (targetH) update.headerHeight = targetH;
      this.setData(update);
    }
  },

  onThinkingComplete: function() {
    this.setData({ showResults: true });
    this._measureHeader();
  },

  _measureHeader: function() {
    var that = this;
    setTimeout(function() { that._measureHeaderNow(); }, 100);
  },

  _measureHeaderNow: function() {
    var that = this;
    var query = wx.createSelectorQuery();
    query.select('.results-fixed-header').boundingClientRect();
    query.select('.search-compact').boundingClientRect();
    query.exec(function(res) {
      var update = {};
      if (res[0]) {
        that._fullHeaderHeight = res[0].bottom;
      }
      if (res[1]) {
        // Collapsed = below search bar + breathing room for padding
        that._collapsedHeaderHeight = res[1].bottom + 16;
      }
      var h = that.data.collapsed ? that._collapsedHeaderHeight : that._fullHeaderHeight;
      if (h) update.headerHeight = h;
      if (Object.keys(update).length) that.setData(update);
    });
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
    // Keep cached favSet in sync
    if (isFav) { this._favSet[id] = true; } else { delete this._favSet[id]; }
    var key = 'results[' + index + ']._isFav';
    var update = {};
    update[key] = isFav;
    this.setData(update);
    wx.showToast({ title: isFav ? '已收藏' : '已取消收藏', icon: 'none', duration: 1000 });
  },

  _markFavorites: function(results) {
    var favSet = this._favSet || {};
    results.forEach(function(card) {
      var cardId = card.id || card._id;
      card._isFav = !!favSet[cardId];
    });
    return results;
  }
});