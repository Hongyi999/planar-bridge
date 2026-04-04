var cloud = require('wx-server-sdk');
var https = require('https');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();
var _ = db.command;

// Use jsDelivr CDN (works from China), with GitHub raw as fallback
var CARD_JSON_URLS = [
  'https://cdn.jsdelivr.net/gh/the-fab-cube/flesh-and-blood-cards@develop/json/english/card.json',
  'https://raw.githubusercontent.com/the-fab-cube/flesh-and-blood-cards/develop/json/english/card.json'
];
var SET_JSON_URLS = [
  'https://cdn.jsdelivr.net/gh/the-fab-cube/flesh-and-blood-cards@develop/json/english/set.json',
  'https://raw.githubusercontent.com/the-fab-cube/flesh-and-blood-cards/develop/json/english/set.json'
];

// Hero classes in FAB
var HERO_CLASSES = [
  'Ninja', 'Guardian', 'Brute', 'Warrior', 'Wizard', 'Mechanologist',
  'Ranger', 'Runeblade', 'Assassin', 'Illusionist', 'Bard', 'Merchant',
  'Shapeshifter', 'Adjudicator', 'Mystic', 'Pirate'
];

// Elemental/talent subtypes that act as class modifiers
var TALENTS = [
  'Light', 'Shadow', 'Elemental', 'Ice', 'Lightning', 'Earth', 'Draconic', 'Royal'
];

// Main card types
var CARD_TYPES = [
  'Hero', 'Weapon', 'Equipment', 'Attack Action', 'Defense Reaction',
  'Action', 'Instant', 'Resource', 'Aura', 'Item', 'Ally', 'Mentor', 'Token',
  'Attack Reaction'
];

// Equipment subtypes
var EQUIPMENT_SUBTYPES = [
  'Head', 'Chest', 'Arms', 'Legs', 'Off-Hand'
];

// Weapon subtypes
var WEAPON_SUBTYPES = [
  'Sword', 'Hammer', 'Bow', 'Dagger', 'Staff', 'Axe', 'Claw', 'Pistol',
  'Scepter', 'Orb', 'Flail', 'Scythe', 'Gun', 'Arakni'
];

// Rarity short code to full name
var RARITY_MAP = {
  'F': 'Fabled',
  'L': 'Legendary',
  'M': 'Majestic',
  'S': 'Super Rare',
  'R': 'Rare',
  'C': 'Common',
  'T': 'Token',
  'P': 'Promo'
};

// Chinese rarity names
var RARITY_CN = {
  'Fabled': '寓言',
  'Legendary': '传奇',
  'Majestic': '威严',
  'Super Rare': '超稀有',
  'Rare': '稀有',
  'Common': '普通',
  'Token': '衍生物',
  'Promo': '促销'
};

// Chinese class names
var CLASS_CN = {
  'Ninja': '忍者', 'Guardian': '守护者', 'Brute': '蛮兽', 'Warrior': '战士',
  'Wizard': '法师', 'Mechanologist': '机械师', 'Ranger': '游侠',
  'Runeblade': '符文剑士', 'Assassin': '刺客', 'Illusionist': '幻术师',
  'Bard': '吟游诗人', 'Merchant': '商人', 'Shapeshifter': '变形者',
  'Generic': '通用', 'Adjudicator': '裁决者', 'Mystic': '神秘使',
  'Pirate': '海盗', 'Light': '光明', 'Shadow': '暗影',
  'Elemental': '元素', 'Ice': '冰霜', 'Lightning': '闪电',
  'Earth': '大地', 'Draconic': '龙裔', 'Royal': '皇家'
};

// Chinese type names
var TYPE_CN = {
  'Hero': '英雄', 'Weapon': '武器', 'Equipment': '装备',
  'Attack Action': '攻击行动', 'Defense Reaction': '防御反应',
  'Action': '行动', 'Instant': '瞬发', 'Resource': '资源',
  'Aura': '光环', 'Item': '物品', 'Ally': '盟友', 'Mentor': '导师',
  'Token': '衍生物', 'Attack Reaction': '攻击反应'
};

/**
 * Extract class, type, subtype from the types array
 */
function parseTypes(types) {
  var heroClass = 'Generic';
  var talent = '';
  var cardType = '';
  var subtype = '';

  // Find hero class
  for (var i = 0; i < types.length; i++) {
    if (HERO_CLASSES.indexOf(types[i]) >= 0) {
      heroClass = types[i];
      break;
    }
  }

  // Find talent
  for (var i = 0; i < types.length; i++) {
    if (TALENTS.indexOf(types[i]) >= 0) {
      talent = types[i];
      break;
    }
  }

  // Find card type - check compound types first
  var typesJoined = types.join(' ');
  for (var i = 0; i < CARD_TYPES.length; i++) {
    if (typesJoined.indexOf(CARD_TYPES[i]) >= 0) {
      cardType = CARD_TYPES[i];
      break;
    }
  }

  // Find equipment/weapon subtype
  for (var i = 0; i < types.length; i++) {
    if (EQUIPMENT_SUBTYPES.indexOf(types[i]) >= 0 || WEAPON_SUBTYPES.indexOf(types[i]) >= 0) {
      subtype = types[i];
      break;
    }
  }

  // Handle weapon subtypes like "Sword (1H)", "Staff (2H)"
  if (cardType === 'Weapon' && !subtype) {
    for (var i = 0; i < types.length; i++) {
      var t = types[i];
      if (t !== 'Weapon' && HERO_CLASSES.indexOf(t) < 0 && TALENTS.indexOf(t) < 0) {
        subtype = t;
        break;
      }
    }
  }

  return {
    heroClass: heroClass,
    talent: talent,
    cardType: cardType || 'Action',
    subtype: subtype
  };
}

/**
 * Transform a card from the-fab-cube schema to our app schema
 */
function transformCard(card) {
  var parsed = parseTypes(card.types || []);
  var classDisplay = parsed.talent ? parsed.talent + ' ' + parsed.heroClass : parsed.heroClass;

  // Find the default printing (first one with an image, or just first)
  var defaultPrinting = null;
  var printings = card.printings || [];
  for (var i = 0; i < printings.length; i++) {
    if (printings[i].image_url) {
      defaultPrinting = printings[i];
      break;
    }
  }
  if (!defaultPrinting && printings.length > 0) {
    defaultPrinting = printings[0];
  }

  var defaultRarityCode = defaultPrinting ? defaultPrinting.rarity : '';
  var defaultRarity = RARITY_MAP[defaultRarityCode] || defaultRarityCode;
  var defaultSetId = defaultPrinting ? defaultPrinting.set_id : '';
  var defaultCardId = defaultPrinting ? defaultPrinting.id : '';

  // Map printings to our format
  var mappedPrintings = printings.map(function(p) {
    return {
      uniqueId: p.unique_id || '',
      id: p.id || '',
      setId: p.set_id || '',
      edition: p.edition || '',
      rarity: RARITY_MAP[p.rarity] || p.rarity || '',
      rarityCode: p.rarity || '',
      foiling: p.foiling || '',
      imageUrl: p.image_url || '',
      cloudImageId: '',
      tcgplayerProductId: p.tcgplayer_product_id || '',
      tcgplayerUrl: p.tcgplayer_url || '',
      artists: p.artists || [],
      artVariations: p.art_variations || [],
      flavorText: p.flavor_text_plain || ''
    };
  });

  return {
    _id: card.unique_id,
    name: card.name || '',
    nameCN: '',
    class: parsed.heroClass,
    classCN: CLASS_CN[parsed.heroClass] || '',
    classDisplay: classDisplay,
    talent: parsed.talent,
    talentCN: CLASS_CN[parsed.talent] || '',
    type: parsed.cardType,
    typeCN: TYPE_CN[parsed.cardType] || '',
    subtype: parsed.subtype || '',
    rarity: defaultRarity,
    rarityCN: RARITY_CN[defaultRarity] || '',
    set: '',
    setCode: defaultSetId,
    cardCode: defaultCardId,
    color: card.color || '',
    pitch: card.pitch || '',
    cost: card.cost === '' ? null : (isNaN(Number(card.cost)) ? card.cost : Number(card.cost)),
    power: card.power === '' ? null : (isNaN(Number(card.power)) ? card.power : Number(card.power)),
    defense: card.defense === '' ? null : (isNaN(Number(card.defense)) ? card.defense : Number(card.defense)),
    health: card.health === '' ? null : Number(card.health) || null,
    intelligence: card.intelligence === '' ? null : Number(card.intelligence) || null,
    types: card.types || [],
    traits: card.traits || [],
    keywords: card.card_keywords || [],
    abilitiesAndEffects: card.abilities_and_effects || [],
    text: card.functional_text_plain || '',
    textMd: card.functional_text || '',
    typeText: card.type_text || '',
    playedHorizontally: card.played_horizontally || false,
    // Legality
    blitzLegal: card.blitz_legal || false,
    ccLegal: card.cc_legal || false,
    commonerLegal: card.commoner_legal || false,
    // Default printing display fields
    imageUrl: defaultPrinting ? (defaultPrinting.image_url || '') : '',
    cloudImageId: '',
    tcgplayerUrl: defaultPrinting ? (defaultPrinting.tcgplayer_url || '') : '',
    // Prices (to be filled later)
    priceLow: null,
    priceMid: null,
    priceMarket: null,
    priceTrend: null,
    // All printings
    printings: mappedPrintings,
    printingCount: mappedPrintings.length,
    // Metadata
    updatedAt: new Date()
  };
}

/**
 * Fetch JSON from URL using built-in https (no external dependency)
 */
function fetchJSON(url) {
  return new Promise(function(resolve, reject) {
    console.log('Fetching: ' + url);
    https.get(url, { timeout: 40000 }, function(res) {
      // Handle redirects (jsDelivr may redirect)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log('Redirect to: ' + res.headers.location);
        fetchJSON(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error('HTTP ' + res.statusCode + ' from ' + url));
        return;
      }
      var chunks = [];
      res.on('data', function(chunk) { chunks.push(chunk); });
      res.on('end', function() {
        try {
          var body = Buffer.concat(chunks).toString('utf8');
          var data = JSON.parse(body);
          console.log('Fetched OK, type=' + typeof data + ', isArray=' + Array.isArray(data) + ', length=' + (Array.isArray(data) ? data.length : 'N/A'));
          resolve(data);
        } catch (e) {
          reject(new Error('JSON parse error: ' + e.message));
        }
      });
      res.on('error', reject);
    }).on('error', reject).on('timeout', function() {
      reject(new Error('Request timeout for ' + url));
    });
  });
}

/**
 * Try fetching from multiple URLs (fallback)
 */
async function fetchJSONWithFallback(urls) {
  for (var i = 0; i < urls.length; i++) {
    try {
      return await fetchJSON(urls[i]);
    } catch (e) {
      console.log('URL failed: ' + urls[i] + ' - ' + e.message);
      if (i === urls.length - 1) throw e;
    }
  }
}

/**
 * Batch upsert cards into DB (max 20 per batch for WeChat cloud DB)
 */
async function upsertBatch(cards) {
  var errors = [];
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var docId = card._id;
    // Remove _id from data — WeChat cloud DB sets it via .doc(id)
    var data = {};
    for (var key in card) {
      if (key !== '_id') data[key] = card[key];
    }
    try {
      await db.collection('cards').doc(docId).set({ data: data });
    } catch (e) {
      errors.push(docId + ': ' + e.message);
    }
  }
  return errors;
}

/**
 * Import sets data
 */
async function importSets(sets) {
  var imported = 0;
  var errors = [];
  for (var i = 0; i < sets.length; i++) {
    var s = sets[i];
    var docId = s.unique_id || s.id;
    try {
      await db.collection('sets').doc(docId).set({
        data: {
          id: s.id || '',
          name: s.name || '',
          printings: (s.printings || []).map(function(p) {
            return {
              uniqueId: p.unique_id || '',
              id: p.id || '',
              edition: p.edition || '',
              releaseDate: p.initial_release_date || '',
              outOfPrint: p.out_of_print || false,
              setLogo: p.set_logo || ''
            };
          }),
          updatedAt: new Date()
        }
      });
      imported++;
    } catch (e) {
      errors.push((s.id || s.unique_id) + ': ' + e.message);
    }
  }
  return { imported: imported, errors: errors };
}

/**
 * Main cloud function entry
 *
 * Actions:
 *   'count'       - Fetch card.json and return total count (for planning batches)
 *   'importBatch' - Fetch card.json, transform and import cards[offset:offset+limit]
 *   'importSets'  - Fetch and import all sets
 *   'stats'       - Return current DB card/set counts
 */
exports.main = async function(event) {
  var action = event.action || 'stats';

  if (action === 'stats') {
    var cardCount = await db.collection('cards').count();
    var setCount = await db.collection('sets').count();
    return {
      success: true,
      cardCount: cardCount.total,
      setCount: setCount.total
    };
  }

  if (action === 'importSets') {
    console.log('Fetching sets data...');
    var sets = await fetchJSONWithFallback(SET_JSON_URLS);
    console.log('Fetched ' + sets.length + ' sets');
    var result = await importSets(sets);
    return {
      success: true,
      imported: result.imported,
      total: sets.length,
      errors: result.errors
    };
  }

  if (action === 'count') {
    console.log('Fetching card data from GitHub...');
    var cards = await fetchJSONWithFallback(CARD_JSON_URLS);
    return {
      success: true,
      total: cards.length
    };
  }

  if (action === 'importBatch') {
    var offset = event.offset || 0;
    var limit = event.limit || 50;

    console.log('Fetching card data from GitHub...');
    var allCards = await fetchJSONWithFallback(CARD_JSON_URLS);
    console.log('Total cards from source: ' + allCards.length);

    var batch = allCards.slice(offset, offset + limit);
    console.log('Processing batch: offset=' + offset + ', count=' + batch.length);

    var transformed = batch.map(transformCard);
    var errors = await upsertBatch(transformed);

    var hasMore = (offset + limit) < allCards.length;
    var totalPrintings = 0;
    transformed.forEach(function(c) { totalPrintings += c.printingCount; });

    return {
      success: true,
      imported: batch.length,
      totalSource: allCards.length,
      offset: offset,
      nextOffset: hasMore ? offset + limit : null,
      hasMore: hasMore,
      printingsInBatch: totalPrintings,
      errors: errors
    };
  }

  return { success: false, error: 'Unknown action: ' + action };
};
