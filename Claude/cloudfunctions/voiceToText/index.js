const cloud = require('wx-server-sdk');
const { pinyin } = require('pinyin-pro');
cloud.init({ env: 'dev-7gpmka26fbecea2a' });
const db = cloud.database();

const BOT_ID = 'ibot-planarbridg-wieezl';

// Levenshtein distance for pinyin fuzzy matching
function levenshtein(a, b) {
  var m = a.length, n = b.length;
  var dp = [];
  for (var i = 0; i <= m; i++) {
    dp[i] = [i];
    for (var j = 1; j <= n; j++) {
      dp[i][j] = i === 0 ? j : 0;
    }
  }
  for (var i = 1; i <= m; i++) {
    for (var j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

// Convert text to pinyin string (no tones, space-separated)
function toPinyin(text) {
  if (!text) return '';
  return pinyin(text, { toneType: 'none', type: 'array' }).join(' ').toLowerCase();
}

// Find best matching card by pinyin similarity
function pinyinMatch(rawText, cards) {
  var inputPy = toPinyin(rawText);
  if (!inputPy) return null;

  var bestMatch = null;
  var bestDist = Infinity;
  var inputLen = inputPy.replace(/\s/g, '').length;

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    if (!card.nameCN) continue;
    var cardPy = toPinyin(card.nameCN);
    var dist = levenshtein(inputPy, cardPy);
    // Threshold: allow up to 30% edit distance relative to input length
    var threshold = Math.max(2, Math.floor(inputLen * 0.3));
    if (dist < bestDist && dist <= threshold) {
      bestDist = dist;
      bestMatch = card;
    }
  }
  return bestMatch;
}

exports.main = async (event) => {
  const { fileID } = event;
  if (!fileID) return { text: '', error: '未提供音频文件' };

  try {
    // Step 1: Get temp URL for audio
    const urlRes = await cloud.getTempFileURL({ fileList: [fileID] });
    const audioUrl = urlRes.fileList[0].tempFileURL;

    // Step 2: Speech-to-text
    var rawText = '';
    const ai = cloud.extend.AI;

    // Try CloudBase ASR first
    try {
      const asrResult = await ai.bot.speechToText({ fileID: fileID });
      rawText = (asrResult.text || asrResult.result || '').trim();
    } catch (asrErr) {
      console.warn('CloudBase ASR not available, falling back to Hunyuan:', asrErr.message);
      // Fallback: use Hunyuan model
      try {
        const sttResult = await ai.createModel('hunyuan-turbo').generateText({
          messages: [{ role: 'user', content: '将以下音频中的语音转写为中文文字，只返回识别出的文字内容，不要加任何解释：' + audioUrl }]
        });
        rawText = (sttResult.text || sttResult.content || '').trim();
      } catch (sttErr) {
        console.error('Hunyuan STT error:', sttErr);
        return { text: '', error: '语音识别失败，请使用文字搜索' };
      }
    }

    if (!rawText) return { text: '', error: '未能识别语音内容' };

    // Step 3: Load card names from database
    var allCards = [];
    var skip = 0;
    var batchSize = 1000;
    while (true) {
      var batch = await db.collection('cards')
        .field({ nameCN: true, name: true })
        .skip(skip)
        .limit(batchSize)
        .get();
      allCards = allCards.concat(batch.data);
      if (batch.data.length < batchSize) break;
      skip += batchSize;
    }

    // Step 4: Exact match first (fastest)
    var exactMatch = allCards.find(function(c) { return c.nameCN === rawText; });
    if (exactMatch) {
      return {
        text: exactMatch.name,
        nameCN: exactMatch.nameCN,
        name: exactMatch.name,
        rawText: rawText
      };
    }

    // Step 5: Pinyin fuzzy matching
    var pyMatch = pinyinMatch(rawText, allCards);
    if (pyMatch) {
      return {
        text: pyMatch.name,
        nameCN: pyMatch.nameCN,
        name: pyMatch.name,
        rawText: rawText
      };
    }

    // Step 6: AI fallback — send to Hunyuan with card name list for semantic matching
    try {
      // Only send a subset of card names to avoid token limits
      var cardNameList = allCards
        .filter(function(c) { return c.nameCN; })
        .slice(0, 500)
        .map(function(c) { return c.nameCN + '|' + c.name; })
        .join('\n');

      var matchResult = await ai.bot.sendMessage({
        botId: BOT_ID,
        msg: '你是 Flesh and Blood 卡牌游戏助手。用户通过语音说了：「' + rawText + '」\n' +
          '这很可能是某张 FAB 卡牌的中文名称（可能有同音字错误）。\n' +
          '以下是部分卡牌（中文名|英文名）列表：\n' + cardNameList + '\n\n' +
          '请找出最可能匹配的卡牌，只返回 JSON：{"nameCN":"中文名","name":"英文名"}\n' +
          '如果没有匹配，返回：{"nameCN":"","name":""}'
      });

      var matched = {};
      try {
        var jsonStr = matchResult.content.match(/\{[\s\S]*?\}/);
        if (jsonStr) matched = JSON.parse(jsonStr[0]);
      } catch (e) { /* parse error */ }

      if (matched.name) {
        return {
          text: matched.name,
          nameCN: matched.nameCN || '',
          name: matched.name,
          rawText: rawText
        };
      }
    } catch (aiErr) {
      console.error('AI fallback error:', aiErr);
    }

    // No match found — return raw text as-is for user to review
    return {
      text: rawText,
      nameCN: '',
      name: '',
      rawText: rawText
    };
  } catch (err) {
    console.error('voiceToText error:', err);
    return { text: '', error: '语音识别失败，请使用文字搜索' };
  }
};
