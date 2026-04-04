var CLASS_CN = { Ninja: '忍者', Guardian: '守护者', Brute: '蛮兽', Warrior: '战士', Wizard: '法师', Mechanologist: '机械师', Ranger: '游侠', Runeblade: '符文之刃', Assassin: '刺客', Illusionist: '幻术师', Generic: '通用' };
var TYPE_CN = { Equipment: '装备', Weapon: '武器', 'Attack Action': '攻击行动', 'Defense Reaction': '防御反应', Action: '行动', Instant: '瞬发' };
var RARITY_CN = { Legendary: '传奇', Majestic: '威严', Rare: '稀有', Common: '普通', Fabled: '神话' };

function getClassCN(cls) { return CLASS_CN[cls] || cls; }
function getTypeCN(type) { return TYPE_CN[type] || type; }
function getRarityCN(rarity) { return RARITY_CN[rarity] || rarity; }

const CARDS = [
  {
    id: "mask-of-momentum",
    name: "Mask of Momentum",
    nameCN: "动量面具",
    class: "Ninja",
    classCN: "忍者",
    type: "Equipment",
    typeCN: "装备",
    subtype: "Head",
    rarity: "Legendary",
    rarityCN: "传奇",
    set: "Welcome to Rathe",
    setCode: "WTR",
    cardCode: "WTR075",
    cost: 0,
    defense: 2,
    power: null,
    intellect: null,
    life: null,
    pitch: null,
    keywords: ["Blade Break"],
    text: "Once per Turn Effect — When an attack action card you control is the third or higher chain link in a row to hit, draw a card.\n\nBlade Break (If you defend with Mask of Momentum, destroy it when the combat chain closes.)",
    priceLow: 14.99,
    priceMid: 18.49,
    priceMarket: 17.85,
    priceTrend: 8,
    tcgplayerUrl: "https://www.tcgplayer.com/product/225110/flesh-and-blood-tcg-welcome-to-rathe-mask-of-momentum"
  },
  {
    id: "snapdragon-scalers",
    name: "Snapdragon Scalers",
    nameCN: "金鱼草攀缘靴",
    class: "Ninja",
    classCN: "忍者",
    type: "Equipment",
    typeCN: "装备",
    subtype: "Legs",
    rarity: "Legendary",
    rarityCN: "传奇",
    set: "Welcome to Rathe",
    setCode: "WTR",
    cardCode: "WTR076",
    cost: 0,
    defense: 1,
    power: null,
    intellect: null,
    life: null,
    pitch: null,
    keywords: ["Battleworn"],
    text: "When you play a card with cost 0, Snapdragon Scalers gains go again until end of turn.\n\nBattleworn (If you defend with Snapdragon Scalers, put a -1 defense counter on it when the combat chain closes.)",
    priceLow: 11.50,
    priceMid: 14.75,
    priceMarket: 13.90,
    priceTrend: -3,
    tcgplayerUrl: "https://www.tcgplayer.com/product/225107/flesh-and-blood-tcg-welcome-to-rathe-snapdragon-scalers"
  },
  {
    id: "fyendals-spring-tunic",
    name: "Fyendal's Spring Tunic",
    nameCN: "费恩达尔的春之外衣",
    class: "Generic",
    classCN: "通用",
    type: "Equipment",
    typeCN: "装备",
    subtype: "Chest",
    rarity: "Legendary",
    rarityCN: "传奇",
    set: "Crucible of War",
    setCode: "CRU",
    cardCode: "CRU177",
    cost: 0,
    defense: 1,
    power: null,
    intellect: null,
    life: null,
    pitch: null,
    keywords: ["Battleworn"],
    text: "At the start of your turn, if Fyendal's Spring Tunic has less than 3 energy counters, you may put an energy counter on it.\n\nInstant — Remove 2 energy counters from Fyendal's Spring Tunic: Gain {r} (resource point).\n\nBattleworn",
    priceLow: 17.00,
    priceMid: 22.30,
    priceMarket: 20.50,
    priceTrend: 12,
    tcgplayerUrl: "https://www.tcgplayer.com/product/226076/flesh-and-blood-tcg-crucible-of-war-fyendals-spring-tunic"
  },
  {
    id: "breaking-scales",
    name: "Breaking Scales",
    nameCN: "碎鳞",
    class: "Ninja",
    classCN: "忍者",
    type: "Equipment",
    typeCN: "装备",
    subtype: "Legs",
    rarity: "Legendary",
    rarityCN: "传奇",
    set: "Crucible of War",
    setCode: "CRU",
    cardCode: "CRU178",
    cost: 0,
    defense: 1,
    power: null,
    intellect: null,
    life: null,
    pitch: null,
    keywords: ["Blade Break"],
    text: "Once per Turn Instant — When you attack with a weapon, if it has hit this combat chain, you may destroy Breaking Scales. If you do, the attack gains +2 power.\n\nBlade Break",
    priceLow: 3.80,
    priceMid: 5.20,
    priceMarket: 4.95,
    priceTrend: 0,
    tcgplayerUrl: "https://www.tcgplayer.com/product/226049/flesh-and-blood-tcg-crucible-of-war-breaking-scales"
  },
  {
    id: "enlightened-strike",
    name: "Enlightened Strike",
    nameCN: "开悟之击",
    class: "Generic",
    classCN: "通用",
    type: "Attack Action",
    typeCN: "攻击行动",
    subtype: null,
    rarity: "Majestic",
    rarityCN: "威严",
    set: "Welcome to Rathe",
    setCode: "WTR",
    cardCode: "WTR162",
    cost: 3,
    defense: null,
    power: 4,
    intellect: null,
    life: null,
    pitch: null,
    keywords: ["Go again"],
    text: "If Enlightened Strike hits, draw a card.\n\nGo again",
    priceLow: 4.50,
    priceMid: 6.25,
    priceMarket: 5.80,
    priceTrend: 5,
    tcgplayerUrl: "https://www.tcgplayer.com/product/225229/flesh-and-blood-tcg-welcome-to-rathe-enlightened-strike"
  },
  {
    id: "command-and-conquer",
    name: "Command and Conquer",
    nameCN: "命令与征服",
    class: "Generic",
    classCN: "通用",
    type: "Attack Action",
    typeCN: "攻击行动",
    subtype: null,
    rarity: "Majestic",
    rarityCN: "威严",
    set: "Arcane Rising",
    setCode: "ARC",
    cardCode: "ARC159",
    cost: 2,
    defense: null,
    power: 6,
    intellect: null,
    life: null,
    pitch: null,
    keywords: [],
    text: "If Command and Conquer hits, your opponent banishes a card from their arsenal. If a card with cost 3 or greater is banished this way, they lose 1 life point.",
    priceLow: 3.50,
    priceMid: 4.80,
    priceMarket: 4.50,
    priceTrend: 0,
    tcgplayerUrl: "https://www.tcgplayer.com/product/225899/flesh-and-blood-tcg-arcane-rising-command-and-conquer"
  },
  {
    id: "art-of-war",
    name: "Art of War",
    nameCN: "战争艺术",
    class: "Generic",
    classCN: "通用",
    type: "Attack Action",
    typeCN: "攻击行动",
    subtype: null,
    rarity: "Majestic",
    rarityCN: "威严",
    set: "Crucible of War",
    setCode: "CRU",
    cardCode: "CRU187",
    cost: 7,
    defense: null,
    power: 7,
    intellect: null,
    life: null,
    pitch: null,
    keywords: ["Dominate", "Go again"],
    text: "Dominate (The defending hero can't defend Art of War with more than 1 card from their hand.)\n\nGo again",
    priceLow: 1.50,
    priceMid: 2.50,
    priceMarket: 2.20,
    priceTrend: -2,
    tcgplayerUrl: "https://www.tcgplayer.com/product/225504/flesh-and-blood-tcg-crucible-of-war-art-of-war"
  },
  {
    id: "eye-of-ophidia",
    name: "Eye of Ophidia",
    nameCN: "奥菲迪亚之眼",
    class: "Wizard",
    classCN: "法师",
    type: "Weapon",
    typeCN: "武器",
    subtype: "Staff (2H)",
    rarity: "Legendary",
    rarityCN: "传奇",
    set: "Arcane Rising",
    setCode: "ARC",
    cardCode: "ARC002",
    cost: 0,
    defense: null,
    power: null,
    intellect: null,
    life: null,
    pitch: null,
    keywords: ["Once per Turn Action"],
    text: "Once per Turn Action — {r}{r}{r}: Deal 1 arcane damage.",
    priceLow: 45.00,
    priceMid: 58.00,
    priceMarket: 52.50,
    priceTrend: 15,
    tcgplayerUrl: "https://www.tcgplayer.com/product/225843/flesh-and-blood-tcg-arcane-rising-eye-of-ophidia"
  }
];

function getCardById(id) {
  return CARDS.find(c => c.id === id) || null;
}

function searchCards(filters) {
  return CARDS.filter(card => {
    if (filters.class && card.class.toLowerCase() !== filters.class.toLowerCase()) return false;
    if (filters.rarity && card.rarity.toLowerCase() !== filters.rarity.toLowerCase()) return false;
    if (filters.type && !card.type.toLowerCase().includes(filters.type.toLowerCase())) return false;
    if (filters.setCode && card.setCode.toLowerCase() !== filters.setCode.toLowerCase()) return false;
    if (filters.priceMax && card.priceMid > filters.priceMax) return false;
    if (filters.priceMin && card.priceMid < filters.priceMin) return false;
    if (filters.keywords && filters.keywords.length > 0) {
      const cardKw = card.keywords.map(k => k.toLowerCase());
      const cardText = card.text.toLowerCase();
      const match = filters.keywords.some(k => cardKw.includes(k) || cardText.includes(k));
      if (!match) return false;
    }
    return true;
  });
}

function getAllCards() {
  return CARDS;
}

module.exports = {
  CARDS,
  getCardById,
  searchCards,
  getAllCards,
  getClassCN,
  getTypeCN,
  getRarityCN
};
