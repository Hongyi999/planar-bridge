var cloud = require('wx-server-sdk');
var got = require('got');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
var db = cloud.database();
var _ = db.command;

// GitHub raw URL for the-fab-cube card data
var CARD_JSON_URL = 'https://raw.githubusercontent.com/the-fab-cube/flesh-and-blood-cards/develop/json/english/card.json';
var SET_JSON_URL = 'https://raw.githubusercontent.com/the-fab-cube/flesh-and-blood-cards/develop/json/english/set.json';

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
 * Fetch JSON from URL
 */
async function fetchJSON(url) {
  var response = await got(url, {
    responseType: 'json',
    timeout: { request: 30000 },
    retry: { limit: 2 }
  });
  return response.body;
}

/**
 * Batch upsert cards into DB (max 20 per batch for WeChat cloud DB)
 */
async function upsertBatch(cards) {
  var errors = [];
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    try {
      await db.collection('cards').doc(card._id).set({
        data: card
      });
    } catch (e) {
      errors.push(card._id + ': ' + e.message);
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
    try {
      await db.collection('sets').doc(s.unique_id || s.id).set({
        data: {
          _id: s.unique_id || s.id,
          id: s.id || '',
          name: s.name || '',
          printings: (s.printings || []).map(function(p) {
            return {
              uniqueId: p.unique_id || '',
              id: p.id || '',
              edition: p.edition || ''
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
    console.log('Fetching sets data from GitHub...');
    var sets = await fetchJSON(SET_JSON_URL);
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
    var cards = await fetchJSON(CARD_JSON_URL);
    return {
      success: true,
      total: cards.length
    };
  }

  if (action === 'importBatch') {
    var offset = event.offset || 0;
    var limit = event.limit || 50;

    console.log('Fetching card data from GitHub...');
    var allCards = await fetchJSON(CARD_JSON_URL);
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
