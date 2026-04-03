function parseQuery(query) {
  const q = query.toLowerCase();
  const filters = {};

  // Class detection
  var classes = ['ninja','guardian','brute','warrior','wizard','mechanologist','ranger','runeblade','assassin','illusionist','generic'];
  classes.forEach(function(c) { if (q.includes(c)) filters.class = c.charAt(0).toUpperCase() + c.slice(1); });

  // Rarity detection
  var rarities = ['legendary','majestic','rare','common','fabled'];
  rarities.forEach(function(r) { if (q.includes(r)) filters.rarity = r.charAt(0).toUpperCase() + r.slice(1); });

  // Type detection
  var types = ['equipment','weapon','attack action','defense reaction','attack','action','instant'];
  types.forEach(function(t) {
    if (q.includes(t)) filters.type = t.split(' ').map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  });

  // Chinese type mapping
  if (q.includes('装备')) filters.type = 'Equipment';
  if (q.includes('武器')) filters.type = 'Weapon';
  if (q.includes('攻击')) filters.type = 'Attack Action';

  // Chinese rarity mapping
  if (q.includes('传奇')) filters.rarity = 'Legendary';

  // Price detection
  var priceMatch = q.match(/under\s*\$?(\d+)/i) || q.match(/(\d+)\s*以下/) || q.match(/below\s*\$?(\d+)/i) || q.match(/\$(\d+)\s*以下/);
  if (priceMatch) filters.priceMax = parseFloat(priceMatch[1]);

  // Set detection
  var sets = {wtr:'WTR',arc:'ARC',cru:'CRU',mon:'MON',ele:'ELE',eve:'EVE',upr:'UPR',uprising:'UPR',dyn:'DYN',out:'OUT',dtd:'DTD',bri:'BRI',hvy:'HVY',mst:'MST',ros:'ROS',hnt:'HNT'};
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
    types[c.type] = (types[c.type] || 0) + 1;
    sets[c.setCode] = (sets[c.setCode] || 0) + 1;
  });

  var typeStr = Object.keys(types).join('、');
  var setStr = Object.keys(sets).join('、');

  return '找到 ' + count + ' 张匹配卡牌，类型包括 ' + typeStr + '，来自 ' + setStr + ' 系列。已获取 TCGPlayer 最新市价。';
}

function getThinkingSteps(query, filters) {
  var filterDesc = [];
  if (filters.class) filterDesc.push('class=' + filters.class);
  if (filters.rarity) filterDesc.push('rarity=' + filters.rarity);
  if (filters.type) filterDesc.push('type=' + filters.type);
  if (filters.setCode) filterDesc.push('set=' + filters.setCode);
  if (filters.priceMax) filterDesc.push('price<$' + filters.priceMax);

  return [
    {
      label: 'Understanding query intent...',
      meta: filterDesc.length > 0 ? filterDesc.join(' · ') : 'analyzing keywords',
      color: 'purple',
      icon: 'clock'
    },
    {
      label: 'Searching FAB database...',
      meta: '4,200+ cards · filtering by ' + (filterDesc.length > 0 ? filterDesc.join(' + ') : 'keywords'),
      color: 'gold',
      icon: 'search'
    },
    {
      label: 'Fetching TCGPlayer market prices...',
      meta: 'pulling live pricing data',
      color: 'green',
      icon: 'dollar'
    }
  ];
}

module.exports = {
  parseQuery,
  generateSummary,
  getThinkingSteps
};
