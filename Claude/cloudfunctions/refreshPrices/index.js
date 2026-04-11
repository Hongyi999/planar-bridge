/**
 * refreshPrices — 定时从 JustTCG 拉取卡牌市场价并更新数据库
 *
 * 触发方式：
 *   1. 定时触发器（config.json 中 triggers 字段）— 每天凌晨 4 点自动运行
 *   2. 手动调用（event.tier = 'daily' | 'weekly' | 'monthly'）
 *
 * 分层策略（按稀有度和日期轮换，避免 API 配额耗尽）：
 *   - 每月 1 号：刷新 Rare/Common/Token（monthly tier）
 *   - 每周日：   刷新 Majestic/Super Rare/Promo（weekly tier）
 *   - 其它日期： 刷新 Fabled/Legendary（daily tier）
 *
 * 限制：
 *   - JustTCG 免费层 10 req/min（每批间隔 7 秒）
 *   - 云函数超时 60 秒 → 每次运行最多 6 批 × 20 张 = 120 张
 *   - 一批处理不完的卡牌会在下次触发时继续（按 priceUpdatedAt 过滤已更新的）
 */

var cloud = require('wx-server-sdk');
var https = require('https');
var url = require('url');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();
var _ = db.command;

// --- 配置 ---
var JUSTTCG_KEY = 'tcg_42778f99df49474188696375021301ce';
var JUSTTCG_URL = 'https://api.justtcg.com/functions/v1/cards';

var PRICE_TIERS = {
  daily:   { rarities: ['Fabled', 'Legendary'],           skipDays: 0 },
  weekly:  { rarities: ['Majestic', 'Super Rare', 'Promo'], skipDays: 7 },
  monthly: { rarities: ['Rare', 'Common', 'Token'],       skipDays: 30 }
};

var BATCH_SIZE = 20;           // JustTCG 单次请求最多 20 张
var MAX_BATCHES_PER_RUN = 6;   // 60 秒超时内最多处理的批次数
var RATE_DELAY_MS = 7000;      // 批次间隔（10 req/min 限流）

// --- 工具函数 ---
function delay(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

/**
 * POST JSON 到 JustTCG API（用 Node.js 内置 https，避免额外依赖）
 */
function postJson(targetUrl, headers, body) {
  return new Promise(function(resolve, reject) {
    var data = JSON.stringify(body);
    var parsed = url.parse(targetUrl);
    var options = {
      hostname: parsed.hostname,
      path: parsed.path,
      method: 'POST',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    if (headers) {
      Object.keys(headers).forEach(function(k) { options.headers[k] = headers[k]; });
    }
    var req = https.request(options, function(res) {
      var chunks = [];
      res.on('data', function(c) { chunks.push(c); });
      res.on('end', function() {
        var text = Buffer.concat(chunks).toString('utf8');
        var parsedBody = null;
        try { parsedBody = JSON.parse(text); } catch (e) { /* 忽略 */ }
        resolve({ statusCode: res.statusCode, data: parsedBody });
      });
    });
    req.on('error', reject);
    req.on('timeout', function() {
      req.destroy(new Error('JustTCG 请求超时'));
    });
    req.write(data);
    req.end();
  });
}

/**
 * 根据触发时间决定使用哪个分层
 * 北京时间，日期决定优先级
 */
function pickTierByDate() {
  var now = new Date();
  // 云函数默认 UTC，转北京时间（UTC+8）
  var beijing = new Date(now.getTime() + 8 * 3600 * 1000);
  var dayOfMonth = beijing.getUTCDate();
  var dayOfWeek = beijing.getUTCDay(); // 0=周日

  if (dayOfMonth === 1) return 'monthly';
  if (dayOfWeek === 0) return 'weekly';
  return 'daily';
}

/**
 * 查询该分层下需要更新的卡牌（排除最近已更新的）
 */
async function loadCardsForRarities(rarities, skipDays) {
  var cutoff = skipDays > 0 ? new Date(Date.now() - skipDays * 86400000) : null;
  var results = [];
  var limit = 100;
  var maxPages = 20; // 最多扫 2000 张用于批次排序

  for (var page = 0; page < maxPages; page++) {
    var res;
    try {
      res = await db.collection('cards')
        .where({ rarity: _.in(rarities) })
        .skip(page * limit)
        .limit(limit)
        .field({ _id: true, name: true, rarity: true, printings: true, priceUpdatedAt: true })
        .get();
    } catch (e) {
      console.error('查询卡牌失败 page=' + page, e.message);
      break;
    }
    if (!res.data || res.data.length === 0) break;

    res.data.forEach(function(card) {
      // 已在 cutoff 内更新过的跳过
      if (cutoff && card.priceUpdatedAt && new Date(card.priceUpdatedAt) > cutoff) return;

      // 从 printings 里找到第一个带 tcgplayerProductId 的
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
        results.push({
          cardId: card._id,
          productId: String(productId)
        });
      }
    });

    if (res.data.length < limit) break;
  }
  return results;
}

/**
 * 解析 JustTCG 响应，提取 Near Mint 价格
 */
function parseJustTcgResponse(data, batch) {
  var results = [];
  try {
    var items = (data && data.data) || (Array.isArray(data) ? data : []);
    var cardMap = {};
    batch.forEach(function(c) { cardMap[String(c.productId)] = c; });

    items.forEach(function(item) {
      var tcgId = String(item.tcgplayerId || '');
      var card = cardMap[tcgId];
      if (!card) return;

      var variants = item.variants || [];
      if (variants.length === 0) return;

      // 优先 Near Mint + Normal/Unlimited
      var best = null;
      for (var i = 0; i < variants.length; i++) {
        var v = variants[i];
        if (v.condition === 'Near Mint' && (v.printing === 'Normal' || v.printing === 'Unlimited')) {
          best = v; break;
        }
      }
      if (!best) {
        for (var i = 0; i < variants.length; i++) {
          if (variants[i].condition === 'Near Mint') { best = variants[i]; break; }
        }
      }
      if (!best) best = variants[0];

      var market = best.marketPrice || best.market_price || best.price || null;
      var low = best.lowPrice || best.low_price || null;
      var mid = best.midPrice || best.mid_price || null;
      var trend = best.priceChange7d || best.directLowPrice || null;

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
    console.error('解析 JustTCG 响应失败:', e.message);
  }
  return results;
}

/**
 * 批量写入价格到数据库
 */
async function writePrices(updates) {
  var updated = 0;
  for (var i = 0; i < updates.length; i++) {
    var p = updates[i];
    try {
      await db.collection('cards').doc(p.cardId).update({
        data: {
          priceLow: p.priceLow || null,
          priceMid: p.priceMid || null,
          priceMarket: p.priceMarket || null,
          priceTrend: p.priceTrend || null,
          priceUpdatedAt: new Date()
        }
      });
      updated++;
    } catch (e) {
      console.error('价格写入失败 cardId=' + p.cardId, e.message);
    }
  }
  return updated;
}

// --- 主入口 ---
exports.main = async function(event) {
  // 优先级：event.tier > TriggerName 约定 > 按日期自动选择
  var tier;
  if (event && event.tier && PRICE_TIERS[event.tier]) {
    tier = event.tier;
  } else if (event && event.TriggerName === 'priceRefreshWeekly') {
    tier = 'weekly';
  } else if (event && event.TriggerName === 'priceRefreshMonthly') {
    tier = 'monthly';
  } else {
    tier = pickTierByDate();
  }

  var tierConf = PRICE_TIERS[tier];
  console.log('refreshPrices 启动 tier=' + tier + ' rarities=' + tierConf.rarities.join(','));

  // 加载待更新卡牌
  var queue;
  try {
    queue = await loadCardsForRarities(tierConf.rarities, tierConf.skipDays);
  } catch (e) {
    console.error('加载卡牌失败:', e.message);
    return { success: false, error: '加载卡牌失败: ' + e.message };
  }

  console.log('待更新卡牌数=' + queue.length);

  if (queue.length === 0) {
    return {
      success: true,
      tier: tier,
      message: '该分层所有卡牌均已最新，无需更新',
      cardsUpdated: 0
    };
  }

  // 切分成 20 张一批
  var batches = [];
  for (var i = 0; i < queue.length; i += BATCH_SIZE) {
    batches.push(queue.slice(i, i + BATCH_SIZE));
  }

  var maxBatches = Math.min(MAX_BATCHES_PER_RUN, batches.length);
  var totalUpdated = 0;
  var totalErrors = 0;
  var batchesProcessed = 0;

  for (var b = 0; b < maxBatches; b++) {
    var batch = batches[b];
    try {
      var postBody = batch.map(function(c) { return { tcgplayerId: c.productId }; });
      var apiRes = await postJson(JUSTTCG_URL, { 'x-api-key': JUSTTCG_KEY }, postBody);

      if (apiRes.statusCode === 429) {
        console.warn('遭遇 429 限流，停止本次运行');
        break;
      }
      if (apiRes.statusCode !== 200 || !apiRes.data) {
        console.error('JustTCG API 错误 status=' + apiRes.statusCode);
        totalErrors += batch.length;
      } else {
        var updates = parseJustTcgResponse(apiRes.data, batch);
        if (updates.length > 0) {
          var n = await writePrices(updates);
          totalUpdated += n;
        }
      }
      batchesProcessed++;
    } catch (e) {
      console.error('批次处理失败 b=' + b, e.message);
      totalErrors += batch.length;
    }

    // 批次间隔，最后一批不等待
    if (b < maxBatches - 1) {
      await delay(RATE_DELAY_MS);
    }
  }

  var result = {
    success: true,
    tier: tier,
    batchesProcessed: batchesProcessed,
    batchesRemaining: batches.length - maxBatches,
    cardsUpdated: totalUpdated,
    errors: totalErrors
  };
  console.log('refreshPrices 完成:', JSON.stringify(result));
  return result;
};
