const cloud = require('wx-server-sdk');
cloud.init({ env: 'dev-7gpmka26fbecea2a' });
const db = cloud.database();

// Seed cards — the 8 cards from the original hardcoded data
const SEED_CARDS = [
  {
    _id: 'mask-of-momentum',
    name: 'Mask of Momentum', nameCN: '动量面具',
    class: 'Ninja', classCN: '忍者',
    type: 'Equipment', typeCN: '装备', subtype: 'Head',
    rarity: 'Legendary', rarityCN: '传奇',
    set: 'Welcome to Rathe', setCode: 'WTR', cardCode: 'WTR075',
    cost: 0, defense: 2, power: null, intellect: null, life: null, pitch: null,
    keywords: ['Blade Break'],
    text: 'Once per Turn Effect — When an attack action card you control is the third or higher chain link in a row to hit, draw a card.\n\nBlade Break (If you defend with Mask of Momentum, destroy it when the combat chain closes.)',
    priceLow: 14.99, priceMid: 18.49, priceMarket: 17.85, priceTrend: 8,
    tcgplayerUrl: 'https://www.tcgplayer.com/product/225110/flesh-and-blood-tcg-welcome-to-rathe-mask-of-momentum',
    imageUrl: '', updatedAt: new Date()
  },
  {
    _id: 'snapdragon-scalers',
    name: 'Snapdragon Scalers', nameCN: '金鱼草攀缘靴',
    class: 'Ninja', classCN: '忍者',
    type: 'Equipment', typeCN: '装备', subtype: 'Legs',
    rarity: 'Legendary', rarityCN: '传奇',
    set: 'Welcome to Rathe', setCode: 'WTR', cardCode: 'WTR076',
    cost: 0, defense: 1, power: null, intellect: null, life: null, pitch: null,
    keywords: ['Battleworn'],
    text: 'When you play a card with cost 0, Snapdragon Scalers gains go again until end of turn.\n\nBattleworn (If you defend with Snapdragon Scalers, put a -1 defense counter on it when the combat chain closes.)',
    priceLow: 11.50, priceMid: 14.75, priceMarket: 13.90, priceTrend: -3,
    tcgplayerUrl: 'https://www.tcgplayer.com/product/225107/flesh-and-blood-tcg-welcome-to-rathe-snapdragon-scalers',
    imageUrl: '', updatedAt: new Date()
  },
  {
    _id: 'fyendals-spring-tunic',
    name: "Fyendal's Spring Tunic", nameCN: '费恩达尔的春之外衣',
    class: 'Generic', classCN: '通用',
    type: 'Equipment', typeCN: '装备', subtype: 'Chest',
    rarity: 'Legendary', rarityCN: '传奇',
    set: 'Crucible of War', setCode: 'CRU', cardCode: 'CRU177',
    cost: 0, defense: 1, power: null, intellect: null, life: null, pitch: null,
    keywords: ['Battleworn'],
    text: "At the start of your turn, if Fyendal's Spring Tunic has less than 3 energy counters, you may put an energy counter on it.\n\nInstant — Remove 2 energy counters from Fyendal's Spring Tunic: Gain {r} (resource point).\n\nBattleworn",
    priceLow: 17.00, priceMid: 22.30, priceMarket: 20.50, priceTrend: 12,
    tcgplayerUrl: 'https://www.tcgplayer.com/product/226076/flesh-and-blood-tcg-crucible-of-war-fyendals-spring-tunic',
    imageUrl: '', updatedAt: new Date()
  },
  {
    _id: 'breaking-scales',
    name: 'Breaking Scales', nameCN: '碎鳞',
    class: 'Ninja', classCN: '忍者',
    type: 'Equipment', typeCN: '装备', subtype: 'Legs',
    rarity: 'Legendary', rarityCN: '传奇',
    set: 'Crucible of War', setCode: 'CRU', cardCode: 'CRU178',
    cost: 0, defense: 1, power: null, intellect: null, life: null, pitch: null,
    keywords: ['Blade Break'],
    text: 'Once per Turn Instant — When you attack with a weapon, if it has hit this combat chain, you may destroy Breaking Scales. If you do, the attack gains +2 power.\n\nBlade Break',
    priceLow: 3.80, priceMid: 5.20, priceMarket: 4.95, priceTrend: 0,
    tcgplayerUrl: 'https://www.tcgplayer.com/product/226049/flesh-and-blood-tcg-crucible-of-war-breaking-scales',
    imageUrl: '', updatedAt: new Date()
  },
  {
    _id: 'enlightened-strike',
    name: 'Enlightened Strike', nameCN: '开悟之击',
    class: 'Generic', classCN: '通用',
    type: 'Attack Action', typeCN: '攻击行动', subtype: null,
    rarity: 'Majestic', rarityCN: '威严',
    set: 'Welcome to Rathe', setCode: 'WTR', cardCode: 'WTR162',
    cost: 3, defense: null, power: 4, intellect: null, life: null, pitch: null,
    keywords: ['Go again'],
    text: 'If Enlightened Strike hits, draw a card.\n\nGo again',
    priceLow: 4.50, priceMid: 6.25, priceMarket: 5.80, priceTrend: 5,
    tcgplayerUrl: 'https://www.tcgplayer.com/product/225229/flesh-and-blood-tcg-welcome-to-rathe-enlightened-strike',
    imageUrl: '', updatedAt: new Date()
  },
  {
    _id: 'command-and-conquer',
    name: 'Command and Conquer', nameCN: '命令与征服',
    class: 'Generic', classCN: '通用',
    type: 'Attack Action', typeCN: '攻击行动', subtype: null,
    rarity: 'Majestic', rarityCN: '威严',
    set: 'Arcane Rising', setCode: 'ARC', cardCode: 'ARC159',
    cost: 2, defense: null, power: 6, intellect: null, life: null, pitch: null,
    keywords: [],
    text: "If Command and Conquer hits, your opponent banishes a card from their arsenal. If a card with cost 3 or greater is banished this way, they lose 1 life point.",
    priceLow: 3.50, priceMid: 4.80, priceMarket: 4.50, priceTrend: 0,
    tcgplayerUrl: 'https://www.tcgplayer.com/product/225899/flesh-and-blood-tcg-arcane-rising-command-and-conquer',
    imageUrl: '', updatedAt: new Date()
  },
  {
    _id: 'art-of-war',
    name: 'Art of War', nameCN: '战争艺术',
    class: 'Generic', classCN: '通用',
    type: 'Attack Action', typeCN: '攻击行动', subtype: null,
    rarity: 'Majestic', rarityCN: '威严',
    set: 'Crucible of War', setCode: 'CRU', cardCode: 'CRU187',
    cost: 7, defense: null, power: 7, intellect: null, life: null, pitch: null,
    keywords: ['Dominate', 'Go again'],
    text: "Dominate (The defending hero can't defend Art of War with more than 1 card from their hand.)\n\nGo again",
    priceLow: 1.50, priceMid: 2.50, priceMarket: 2.20, priceTrend: -2,
    tcgplayerUrl: 'https://www.tcgplayer.com/product/225504/flesh-and-blood-tcg-crucible-of-war-art-of-war',
    imageUrl: '', updatedAt: new Date()
  },
  {
    _id: 'eye-of-ophidia',
    name: 'Eye of Ophidia', nameCN: '奥菲迪亚之眼',
    class: 'Wizard', classCN: '法师',
    type: 'Weapon', typeCN: '武器', subtype: 'Staff (2H)',
    rarity: 'Legendary', rarityCN: '传奇',
    set: 'Arcane Rising', setCode: 'ARC', cardCode: 'ARC002',
    cost: 0, defense: null, power: null, intellect: null, life: null, pitch: null,
    keywords: ['Once per Turn Action'],
    text: 'Once per Turn Action — {r}{r}{r}: Deal 1 arcane damage.',
    priceLow: 45.00, priceMid: 58.00, priceMarket: 52.50, priceTrend: 15,
    tcgplayerUrl: 'https://www.tcgplayer.com/product/225843/flesh-and-blood-tcg-arcane-rising-eye-of-ophidia',
    imageUrl: '', updatedAt: new Date()
  }
];

// Seed sets — from seriesData.js
const SEED_SETS = [
  { _id: 'SEA', code: 'SEA', name: 'High Seas', nameCN: '高海', year: '2025', cardCount: 236, tags: 'Pirate · Necromancer' },
  { _id: 'HNT', code: 'HNT', name: 'The Hunted', nameCN: '猎杀', year: '2025', cardCount: 226, tags: 'Ninja · Warrior · Assassin' },
  { _id: 'SSM', code: 'SSM', name: 'Super Slam', nameCN: '超级猛击', year: '2025', cardCount: 120, tags: 'Supplementary' },
  { _id: 'ROS', code: 'ROS', name: 'Rosetta', nameCN: '罗塞塔', year: '2024', cardCount: 226, tags: 'Earth · Ice · Lightning' },
  { _id: 'MST', code: 'MST', name: 'Part the Mistveil', nameCN: '拨开迷雾', year: '2024', cardCount: 226, tags: 'Mystic · Illusionist' },
  { _id: 'HVY', code: 'HVY', name: 'Heavy Hitters', nameCN: '重拳出击', year: '2024', cardCount: 226, tags: 'Guardian · Brute' },
  { _id: 'BRI', code: 'BRI', name: 'Bright Lights', nameCN: '璀璨之光', year: '2023', cardCount: 226, tags: 'Mechanologist' },
  { _id: 'DTD', code: 'DTD', name: 'Dusk Till Dawn', nameCN: '黄昏到黎明', year: '2023', cardCount: 226, tags: 'Light · Shadow' },
  { _id: 'OUT', code: 'OUT', name: 'Outsiders', nameCN: '局外人', year: '2023', cardCount: 226, tags: 'Assassin · Ranger · Ninja' },
  { _id: 'DYN', code: 'DYN', name: 'Dynasty', nameCN: '王朝', year: '2022', cardCount: 226, tags: 'Royal · Emperor' },
  { _id: 'UPR', code: 'UPR', name: 'Uprising', nameCN: '起义', year: '2022', cardCount: 226, tags: 'Draconic · Illusionist' },
  { _id: 'EVE', code: 'EVE', name: 'Everfest', nameCN: '永恒庆典', year: '2022', cardCount: 226, tags: 'Multi-class · Carnival' },
  { _id: 'HIS', code: 'HIS', name: 'History Pack 1', nameCN: '历史包1', year: '2022', cardCount: 227, tags: 'Reprint Collection' },
  { _id: 'ELE', code: 'ELE', name: 'Tales of Aria', nameCN: '阿瑞亚传说', year: '2021', cardCount: 226, tags: 'Elemental · Ranger · Guardian' },
  { _id: 'MON', code: 'MON', name: 'Monarch', nameCN: '君主', year: '2021', cardCount: 303, tags: 'Light · Shadow' },
  { _id: 'CRU', code: 'CRU', name: 'Crucible of War', nameCN: '战争坩埚', year: '2020', cardCount: 198, tags: 'Supplementary' },
  { _id: 'ARC', code: 'ARC', name: 'Arcane Rising', nameCN: '奥术崛起', year: '2020', cardCount: 226, tags: 'Mechanologist · Wizard · Ranger' },
  { _id: 'WTR', code: 'WTR', name: 'Welcome to Rathe', nameCN: '欢迎来到拉斯', year: '2019', cardCount: 226, tags: 'Brute · Guardian · Ninja · Warrior' }
];

exports.main = async (event) => {
  const action = event.action || 'all';
  const results = { cards: 0, sets: 0, errors: [] };

  try {
    if (action === 'all' || action === 'cards') {
      for (const card of SEED_CARDS) {
        try {
          await db.collection('cards').doc(card._id).set({ data: card });
          results.cards++;
        } catch (e) {
          results.errors.push('card ' + card._id + ': ' + e.message);
        }
      }
    }

    if (action === 'all' || action === 'sets') {
      for (const set of SEED_SETS) {
        try {
          await db.collection('sets').doc(set._id).set({ data: set });
          results.sets++;
        } catch (e) {
          results.errors.push('set ' + set._id + ': ' + e.message);
        }
      }
    }
  } catch (e) {
    results.errors.push('global: ' + e.message);
  }

  return {
    success: results.errors.length === 0,
    imported: { cards: results.cards, sets: results.sets },
    errors: results.errors
  };
};