const cloud = require('wx-server-sdk');
cloud.init({ env: 'dev-7gpmka26fbecea2a' });
const db = cloud.database();
const _ = db.command;

const BOT_ID = 'ibot-planarbridg-wieezl';

// Class/type/rarity mappings for Chinese query support
const CLASS_MAP = {
  '忍者': 'Ninja', '守护者': 'Guardian', '蛮兽': 'Brute', '战士': 'Warrior',
  '法师': 'Wizard', '机械师': 'Mechanologist', '游侠': 'Ranger',
  '符文之刃': 'Runeblade', '符文剑士': 'Runeblade', '刺客': 'Assassin',
  '幻术师': 'Illusionist', '通用': 'Generic', '吟游诗人': 'Bard',
  '神秘使': 'Mystic', '海盗': 'Pirate'
};
const TYPE_MAP = {
  '装备': 'Equipment', '武器': 'Weapon', '攻击行动': 'Attack Action',
  '防御反应': 'Defense Reaction', '行动': 'Action', '瞬发': 'Instant'
};
const RARITY_MAP = {
  '传奇': 'Legendary', '威严': 'Majestic', '稀有': 'Rare', '普通': 'Common', '神话': 'Fabled'
};

// Fallback parser for when AI is unavailable
function fallbackParse(query) {
  var q = query.toLowerCase();
  var filters = {};

  // Class detection
  var classes = ['ninja', 'guardian', 'brute', 'warrior', 'wizard', 'mechanologist', 'ranger', 'runeblade', 'assassin', 'illusionist', 'generic'];
  for (var c of classes) {
    if (q.includes(c)) { filters.class = c.charAt(0).toUpperCase() + c.slice(1); break; }
  }
  // Chinese class
  for (var cn in CLASS_MAP) {
    if (q.includes(cn)) { filters.class = CLASS_MAP[cn]; break; }
  }

  // Rarity detection
  var rarities = { legendary: 'Legendary', majestic: 'Majestic', rare: 'Rare', common: 'Common', fabled: 'Fabled' };
  for (var r in rarities) {
    if (q.includes(r)) { filters.rarity = rarities[r]; break; }
  }
  for (var rcn in RARITY_MAP) {
    if (q.includes(rcn)) { filters.rarity = RARITY_MAP[rcn]; break; }
  }

  // Type detection
  var types = { equipment: 'Equipment', weapon: 'Weapon', 'attack action': 'Attack Action', attack: 'Attack Action', 'defense reaction': 'Defense Reaction', action: 'Action', instant: 'Instant' };
  for (var t in types) {
    if (q.includes(t)) { filters.type = types[t]; break; }
  }
  for (var tcn in TYPE_MAP) {
    if (q.includes(tcn)) { filters.type = TYPE_MAP[tcn]; break; }
  }

  // Price detection — min (multiple "大于X" → take largest)
  var minPatterns = [/(?:over|above)\s*\$?(\d+)/g, /(\d+)\s*(?:刀|美元|块|元)?\s*以上/g, /大于\s*\$?(\d+)/g, /超过\s*\$?(\d+)/g, /金额大于\s*\$?(\d+)/g, /(?:高于|贵于)\s*\$?(\d+)/g];
  var allMins = [];
  for (var mp of minPatterns) { var m; while ((m = mp.exec(q)) !== null) allMins.push(parseFloat(m[1])); }
  if (allMins.length > 0) filters.priceMin = Math.max(...allMins);

  // Price detection — max (multiple "小于X" → take smallest)
  var maxPatterns = [/(?:under|below)\s*\$?(\d+)/g, /(\d+)\s*(?:刀|美元|块|元)?\s*以下/g, /低于\s*\$?(\d+)/g, /小于\s*\$?(\d+)/g];
  var allMaxes = [];
  for (var xp of maxPatterns) { var m2; while ((m2 = xp.exec(q)) !== null) allMaxes.push(parseFloat(m2[1])); }
  if (allMaxes.length > 0) filters.priceMax = Math.min(...allMaxes);

  // Set code detection
  var setCodes = ['WTR', 'ARC', 'CRU', 'MON', 'ELE', 'EVE', 'UPR', 'DYN', 'OUT', 'DTD', 'BRI', 'HVY', 'MST', 'ROS', 'HNT', 'SEA', 'SSM', 'HIS', 'TCC', 'BOL', 'FAI', 'LGS', 'PSM', 'AAZ', 'IRA', 'JDG', 'HP1'];
  for (var sc of setCodes) {
    if (query.toUpperCase().includes(sc)) { filters.setCode = sc; break; }
  }

  return filters;
}

exports.main = async (event) => {
  const { query, sortField, sortOrder } = event;

  if (!query || !query.trim()) {
    return { filters: {}, results: [], resultCount: 0, summary: '请输入搜索关键词' };
  }

  let filters = {};
  let summary = '';
  let aiUsed = false;

  // If pre-parsed filters provided (from follow-up merge), use directly
  if (event.filters && Object.keys(event.filters).length > 0) {
    filters = event.filters;
    aiUsed = false;
  } else {
    // Step 1: Try AI parsing
    try {
      const ai = cloud.extend.AI;
      const parseResult = await ai.bot.sendMessage({
        botId: BOT_ID,
        msg: '你是 Flesh and Blood TCG 卡牌搜索助手。将以下用户查询解析为 JSON 过滤条件。\n' +
          '可用字段: class, type, subtype, rarity, setCode, keywords(数组), priceMax, priceMin, name(模糊匹配)\n' +
          '可用 class: Ninja, Guardian, Brute, Warrior, Wizard, Mechanologist, Ranger, Runeblade, Assassin, Illusionist, Generic\n' +
          '可用 type: Equipment, Weapon, Attack Action, Defense Reaction, Action, Instant\n' +
          '可用 rarity: Common, Rare, Majestic, Legendary, Fabled\n' +
          '仅返回 JSON 对象，不要其他文字。只包含用户明确提到的条件。\n\n' +
          '用户查询: "' + query + '"'
      });
      filters = JSON.parse(parseResult.content);
      aiUsed = true;
    } catch (e) {
      // Fallback to keyword parsing
      filters = fallbackParse(query);
    }
  }

  // Step 2: Build database query
  var dbQuery = {};
  if (filters.class) dbQuery.class = filters.class;
  if (filters.type) dbQuery.type = filters.type;
  if (filters.subtype) dbQuery.subtype = filters.subtype;
  if (filters.rarity) dbQuery.rarity = filters.rarity;
  if (filters.setCode) dbQuery.setCode = filters.setCode;
  if (filters.name) dbQuery.name = db.RegExp({ regexp: filters.name, options: 'i' });
  if (filters.priceMax) dbQuery.priceMid = _.lte(filters.priceMax);
  if (filters.priceMin) {
    dbQuery.priceMid = filters.priceMax
      ? _.gte(filters.priceMin).and(_.lte(filters.priceMax))
      : _.gte(filters.priceMin);
  }
  if (filters.keywords && filters.keywords.length > 0) {
    dbQuery.keywords = _.in(filters.keywords);
  }

  // Step 3: Query database
  var sort = sortField || 'name';
  var order = sortOrder || 'asc';
  var results;
  try {
    results = await db.collection('cards')
      .where(dbQuery)
      .orderBy(sort, order)
      .limit(50)
      .get();
  } catch (e) {
    return { filters, results: [], resultCount: 0, summary: '数据库查询失败: ' + e.message, aiUsed };
  }

  // Step 4: Generate summary
  var count = results.data.length;
  if (aiUsed) {
    try {
      const ai = cloud.extend.AI;
      const sumResult = await ai.bot.sendMessage({
        botId: BOT_ID,
        msg: '用一句简短中文（不超过50字）总结搜索结果：\n查询: "' + query + '"\n' +
          '找到 ' + count + ' 张卡牌' +
          (count > 0 ? '，包括: ' + results.data.slice(0, 3).map(function(c) { return c.nameCN || c.name; }).join('、') : '')
      });
      summary = sumResult.content;
    } catch (e) {
      summary = _buildFallbackSummary(query, results.data);
    }
  } else {
    summary = _buildFallbackSummary(query, results.data);
  }

  return {
    filters: filters,
    results: results.data,
    resultCount: count,
    summary: summary,
    aiUsed: aiUsed
  };
};

function _buildFallbackSummary(query, cards) {
  var count = cards.length;
  if (count === 0) return '未找到匹配「' + query + '」的卡牌，请尝试其他关键词。';
  var types = [];
  var sets = [];
  cards.forEach(function(c) {
    if (c.typeCN && types.indexOf(c.typeCN) === -1) types.push(c.typeCN);
    if (c.setCode && sets.indexOf(c.setCode) === -1) sets.push(c.setCode);
  });
  var parts = ['找到 ' + count + ' 张匹配卡牌'];
  if (types.length > 0) parts.push('类型包括 ' + types.slice(0, 3).join('、'));
  if (sets.length > 0) parts.push('来自 ' + sets.slice(0, 3).join('、') + ' 系列');
  return parts.join('，') + '。';
}