/**
 * AI Parser — handles search query parsing and AI cloud function calls.
 * Retains local parseQuery as fallback, adds cloud AI search.
 */

function parseQuery(query) {
  const q = query.toLowerCase();
  const filters = {};

  // Class detection
  var classes = ['ninja','guardian','brute','warrior','wizard','mechanologist','ranger','runeblade','assassin','illusionist','generic'];
  classes.forEach(function(c) { if (q.includes(c)) filters.class = c.charAt(0).toUpperCase() + c.slice(1); });

  // Chinese class mapping
  var classCN = {'忍者':'Ninja','守护者':'Guardian','蛮兽':'Brute','战士':'Warrior','法师':'Wizard','机械师':'Mechanologist','游侠':'Ranger','符文之刃':'Runeblade','刺客':'Assassin','幻术师':'Illusionist','通用':'Generic'};
  Object.keys(classCN).forEach(function(cn) { if (q.includes(cn)) filters.class = classCN[cn]; });

  // Rarity detection
  var rarities = ['legendary','majestic','rare','common','fabled'];
  rarities.forEach(function(r) { if (q.includes(r)) filters.rarity = r.charAt(0).toUpperCase() + r.slice(1); });
  if (q.includes('传奇')) filters.rarity = 'Legendary';
  if (q.includes('威严')) filters.rarity = 'Majestic';
  if (q.includes('稀有')) filters.rarity = 'Rare';
  if (q.includes('神话')) filters.rarity = 'Fabled';

  // Type detection
  var types = ['equipment','weapon','attack action','defense reaction','attack','action','instant'];
  types.forEach(function(t) {
    if (q.includes(t)) filters.type = t.split(' ').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  });
  if (q.includes('装备')) filters.type = 'Equipment';
  if (q.includes('武器')) filters.type = 'Weapon';
  if (q.includes('攻击')) filters.type = 'Attack Action';
  if (q.includes('防御')) filters.type = 'Defense Reaction';

  // Price detection — max (under/below/以下)
  var priceMaxMatch = q.match(/under\s*\$?(\d+)/i) || q.match(/below\s*\$?(\d+)/i) || q.match(/(\d+)\s*(?:刀|美元|块|元)?\s*以下/) || q.match(/\$(\d+)\s*以下/) || q.match(/低于\s*\$?(\d+)/) || q.match(/小于\s*\$?(\d+)/);
  if (priceMaxMatch) filters.priceMax = parseFloat(priceMaxMatch[1]);

  // Price detection — min (over/above/以上/大于/超过)
  var priceMinMatch = q.match(/over\s*\$?(\d+)/i) || q.match(/above\s*\$?(\d+)/i) || q.match(/(\d+)\s*(?:刀|美元|块|元)?\s*以上/) || q.match(/\$(\d+)\s*以上/) || q.match(/大于\s*\$?(\d+)/) || q.match(/超过\s*\$?(\d+)/) || q.match(/金额大于\s*\$?(\d+)/) || q.match(/(?:价格|金额)\s*[>＞]\s*\$?(\d+)/);
  if (priceMinMatch) filters.priceMin = parseFloat(priceMinMatch[1]);

  // Set detection
  var sets = {wtr:'WTR',arc:'ARC',cru:'CRU',mon:'MON',ele:'ELE',eve:'EVE',upr:'UPR',uprising:'UPR',dyn:'DYN',out:'OUT',dtd:'DTD',bri:'BRI',hvy:'HVY',mst:'MST',ros:'ROS',hnt:'HNT',sea:'SEA'};
  Object.keys(sets).forEach(function(s) { if (q.includes(s)) filters.setCode = sets[s]; });

  // Keyword detection
  var kws = ['go again','dominate','intimidate','arcane barrier','blade break','battleworn'];
  filters.keywords = kws.filter(function(k) { return q.includes(k); });

  return filters;
}

function generateSummary(query, results) {
  var count = results.length;
  if (count === 0) return '未找到匹配的卡牌，请尝试其他搜索词。';

  var types = {};
  var sets = {};
  results.forEach(function(c) {
    types[c.typeCN || c.type] = true;
    sets[c.setCode] = true;
  });

  var typeStr = Object.keys(types).slice(0, 3).join('、');
  var setStr = Object.keys(sets).slice(0, 3).join('、');

  return '找到 ' + count + ' 张匹配卡牌，类型包括 ' + typeStr + '，来自 ' + setStr + ' 系列。已获取 TCGPlayer 最新市价。';
}

function getThinkingSteps(query, filters) {
  var filterDesc = [];
  if (filters && filters.class) filterDesc.push('class=' + filters.class);
  if (filters && filters.rarity) filterDesc.push('rarity=' + filters.rarity);
  if (filters && filters.type) filterDesc.push('type=' + filters.type);
  if (filters && filters.setCode) filterDesc.push('set=' + filters.setCode);
  if (filters && filters.priceMin) filterDesc.push('price>$' + filters.priceMin);
  if (filters && filters.priceMax) filterDesc.push('price<$' + filters.priceMax);

  return [
    {
      label: '理解搜索意图...',
      meta: filterDesc.length > 0 ? filterDesc.join(' · ') : '分析关键词',
      color: 'purple',
      icon: 'clock'
    },
    {
      label: '检索 FAB 卡牌数据库...',
      meta: '云端数据库 · 筛选 ' + (filterDesc.length > 0 ? filterDesc.join(' + ') : '关键词'),
      color: 'gold',
      icon: 'search'
    },
    {
      label: '获取 TCGPlayer 实时价格...',
      meta: '拉取最新价格数据',
      color: 'green',
      icon: 'dollar'
    }
  ];
}

/**
 * Merge two filter objects. Scalar fields: new overrides old.
 * Array fields (keywords): concatenate and deduplicate.
 */
function mergeFilters(base, added) {
  var result = {};
  // Copy base
  Object.keys(base).forEach(function(k) { result[k] = base[k]; });
  // Merge added
  Object.keys(added).forEach(function(k) {
    if (k === 'keywords') {
      var baseKw = result.keywords || [];
      var addedKw = added.keywords || [];
      var merged = baseKw.slice();
      addedKw.forEach(function(kw) {
        if (merged.indexOf(kw) === -1) merged.push(kw);
      });
      if (merged.length > 0) result.keywords = merged;
    } else {
      result[k] = added[k];
    }
  });
  return result;
}

/**
 * AI-powered search via cloud function.
 * Returns { filters, results, resultCount, summary, aiUsed }
 * If preFilters is provided, sends structured filters directly (skip AI re-parsing).
 */
function aiSearch(query, sortField, sortOrder, preFilters) {
  var data = {
    query: query,
    sortField: sortField || 'priceMid',
    sortOrder: sortOrder || 'desc'
  };
  if (preFilters) {
    data.filters = preFilters;
  }
  return new Promise(function(resolve, reject) {
    wx.cloud.callFunction({
      name: 'aiSearch',
      data: data,
      success: function(res) {
        resolve(res.result);
      },
      fail: function(err) {
        reject(err);
      }
    });
  });
}

module.exports = {
  parseQuery: parseQuery,
  mergeFilters: mergeFilters,
  generateSummary: generateSummary,
  getThinkingSteps: getThinkingSteps,
  aiSearch: aiSearch
};