var cardData = require('../../utils/cardData.js');
var aiParser = require('../../utils/aiParser.js');

Page({
  data: {
    statusBarHeight: 20,
    query: '',
    filters: {},
    thinkingSteps: [],
    summary: '',
    resultCount: 0,
    results: [],
    showResults: false
  },
  onLoad(options) {
    var sysInfo = wx.getSystemInfoSync();
    var query = decodeURIComponent(options.query || '');
    var filters = aiParser.parseQuery(query);
    var results = cardData.searchCards(filters);

    // Sort by price descending
    results.sort(function(a, b) { return b.priceMid - a.priceMid; });

    var steps = aiParser.getThinkingSteps(query, filters);
    var summary = aiParser.generateSummary(query, results);

    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20,
      query: query,
      filters: filters,
      thinkingSteps: steps,
      summary: summary,
      resultCount: results.length,
      results: results
    });
  },
  onThinkingComplete() {
    this.setData({ showResults: true });
  },
  onSearch(e) {
    var query = e.detail.value;
    if (query && query.trim()) {
      wx.redirectTo({
        url: '/pages/results/results?query=' + encodeURIComponent(query.trim())
      });
    }
  },
  goBack() {
    wx.navigateBack();
  },
  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },
  onFollowUp() {
    // Could navigate to a new search with context
    wx.showToast({ title: '继续追问功能开发中', icon: 'none' });
  }
});
