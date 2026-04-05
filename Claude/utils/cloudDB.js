/**
 * Cloud Database Access Layer
 * Replaces hardcoded cardData.js with cloud database queries.
 * Falls back to local data on failure.
 */
var cardData = require('./cardData.js');
var seriesData = require('./seriesData.js');

var CACHE_TTL = 60 * 60 * 1000; // 1 hour

function _getDB() {
  return wx.cloud.database();
}

// ---- Cards ----

/**
 * Get a single card by ID, with local cache + cloud fallback
 */
function getCardById(id) {
  return new Promise(function(resolve) {
    if (!id) { resolve(null); return; }

    // Check local cache first
    var cacheKey = 'card_' + id;
    var cached = wx.getStorageSync(cacheKey);
    if (cached && cached._ts && (Date.now() - cached._ts < CACHE_TTL)) {
      resolve(cached.data);
      return;
    }

    // Try cloud database
    var db = _getDB();
    db.collection('cards').doc(id).get().then(function(res) {
      // Cache the result
      wx.setStorageSync(cacheKey, { data: res.data, _ts: Date.now() });
      resolve(res.data);
    }).catch(function() {
      // Fallback to local hardcoded data
      var local = cardData.getCardById(id);
      resolve(local);
    });
  });
}

/**
 * Search cards with filters + pagination + sorting
 */
function searchCards(filters, options) {
  var page = (options && options.page) || 1;
  var pageSize = (options && options.pageSize) || 20;
  var sortField = (options && options.sortField) || 'name';
  var sortOrder = (options && options.sortOrder) || 'asc';

  return new Promise(function(resolve) {
    var db = _getDB();
    var _ = db.command;
    var query = {};

    if (filters.class) query.class = filters.class;
    if (filters.type) query.type = filters.type;
    if (filters.subtype) query.subtype = filters.subtype;
    if (filters.rarity) query.rarity = filters.rarity;
    if (filters.setCode) query.setCode = filters.setCode;
    if (filters.name) query.name = db.RegExp({ regexp: filters.name, options: 'i' });
    if (filters.priceMax) query.priceMid = _.lte(filters.priceMax);
    if (filters.keywords && filters.keywords.length > 0) {
      query.keywords = _.in(filters.keywords);
    }

    db.collection('cards')
      .where(query)
      .orderBy(sortField, sortOrder)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
      .then(function(res) {
        resolve(res.data);
      })
      .catch(function() {
        // Fallback to local search
        var results = cardData.searchCards(filters);
        resolve(results);
      });
  });
}

/**
 * Get cards by set code with pagination
 */
function getCardsBySet(setCode, page, pageSize) {
  page = page || 1;
  pageSize = pageSize || 20;

  return new Promise(function(resolve) {
    var db = _getDB();
    db.collection('cards')
      .where({ setCode: setCode })
      .orderBy('cardCode', 'asc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
      .then(function(res) {
        resolve(res.data);
      })
      .catch(function() {
        // Fallback to local
        var all = cardData.searchCards({ setCode: setCode });
        resolve(all.slice((page - 1) * pageSize, page * pageSize));
      });
  });
}

// ---- Sets ----

/**
 * Get all sets, cached in memory
 */
var _setsCache = null;
function getSets() {
  return new Promise(function(resolve) {
    if (_setsCache) {
      resolve(_setsCache);
      return;
    }

    var db = _getDB();
    db.collection('sets')
      .orderBy('year', 'desc')
      .limit(100)
      .get()
      .then(function(res) {
        _setsCache = res.data;
        resolve(res.data);
      })
      .catch(function() {
        // Fallback to local series data
        var local = seriesData.getSeriesChronological();
        var flat = [];
        local.forEach(function(group) {
          group.sets.forEach(function(s) {
            s.year = group.year;
            flat.push(s);
          });
        });
        resolve(flat);
      });
  });
}

/**
 * Group sets by year (for UI display)
 */
function getSetsGroupedByYear() {
  return getSets().then(function(sets) {
    var groups = {};
    sets.forEach(function(s) {
      var year = s.year || 'Unknown';
      if (!groups[year]) groups[year] = [];
      groups[year].push(s);
    });
    // Convert to array sorted by year desc
    var result = [];
    Object.keys(groups).sort(function(a, b) { return b.localeCompare(a); }).forEach(function(year) {
      result.push({ year: year, sets: groups[year] });
    });
    return result;
  });
}

module.exports = {
  getCardById: getCardById,
  searchCards: searchCards,
  getCardsBySet: getCardsBySet,
  getSets: getSets,
  getSetsGroupedByYear: getSetsGroupedByYear
};