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
  },
  // --- Guardian ---
  { id: "anothos", name: "Anothos", nameCN: "阿诺索斯", class: "Guardian", classCN: "守护者", type: "Weapon", typeCN: "武器", subtype: "Hammer (2H)", rarity: "Majestic", rarityCN: "威严", set: "Welcome to Rathe", setCode: "WTR", cardCode: "WTR003", cost: 2, defense: null, power: 4, intellect: null, life: null, pitch: null, keywords: [], text: "Once per Turn Action — {r}{r}: Attack\n\nAnothos has +1 power for each card in your pitch zone with cost 3 or greater.", priceLow: 1.20, priceMid: 2.50, priceMarket: 2.10, priceTrend: -5, tcgplayerUrl: "" },
  { id: "crippling-crush", name: "Crippling Crush", nameCN: "致残粉碎", class: "Guardian", classCN: "守护者", type: "Attack Action", typeCN: "攻击行动", subtype: null, rarity: "Majestic", rarityCN: "威严", set: "Welcome to Rathe", setCode: "WTR", cardCode: "WTR046", cost: 7, defense: 3, power: 11, intellect: null, life: null, pitch: null, keywords: ["Crush"], text: "Crush — If Crippling Crush deals 4 or more damage to a hero, they discard 2 random cards.", priceLow: 0.80, priceMid: 1.50, priceMarket: 1.30, priceTrend: 0, tcgplayerUrl: "" },
  { id: "tectonic-plating", name: "Tectonic Plating", nameCN: "地壳护甲", class: "Guardian", classCN: "守护者", type: "Equipment", typeCN: "装备", subtype: "Chest", rarity: "Legendary", rarityCN: "传奇", set: "Crucible of War", setCode: "CRU", cardCode: "CRU176", cost: 0, defense: 2, power: null, intellect: null, life: null, pitch: null, keywords: ["Battleworn", "Blade Break"], text: "At the start of your turn, you may put a card from your hand on the bottom of your deck. If you do, draw a card.\n\nBattleworn, Blade Break", priceLow: 8.00, priceMid: 12.50, priceMarket: 11.00, priceTrend: 3, tcgplayerUrl: "" },
  // --- Brute ---
  { id: "romping-club", name: "Romping Club", nameCN: "跳跃棍棒", class: "Brute", classCN: "蛮兽", type: "Weapon", typeCN: "武器", subtype: "Club (2H)", rarity: "Rare", rarityCN: "稀有", set: "Welcome to Rathe", setCode: "WTR", cardCode: "WTR005", cost: 1, defense: null, power: 4, intellect: null, life: null, pitch: null, keywords: [], text: "Once per Turn Action — {r}: Attack\n\nWhen Romping Club hits, you may discard a random card. If you do, draw a card.", priceLow: 0.30, priceMid: 0.75, priceMarket: 0.60, priceTrend: 0, tcgplayerUrl: "" },
  { id: "savage-feast", name: "Savage Feast", nameCN: "野蛮盛宴", class: "Brute", classCN: "蛮兽", type: "Action", typeCN: "行动", subtype: null, rarity: "Majestic", rarityCN: "威严", set: "Welcome to Rathe", setCode: "WTR", cardCode: "WTR120", cost: 0, defense: 3, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "As an additional cost to play Savage Feast, discard a random card.\n\nDraw 2 cards.\n\nGo again", priceLow: 1.00, priceMid: 1.80, priceMarket: 1.50, priceTrend: 2, tcgplayerUrl: "" },
  { id: "mandible-claw", name: "Mandible Claw", nameCN: "下颚利爪", class: "Brute", classCN: "蛮兽", type: "Equipment", typeCN: "装备", subtype: "Arms", rarity: "Legendary", rarityCN: "传奇", set: "Crucible of War", setCode: "CRU", cardCode: "CRU175", cost: 0, defense: 1, power: null, intellect: null, life: null, pitch: null, keywords: ["Blade Break"], text: "Instant — Destroy Mandible Claw: Your next attack this turn gets +3 power.\n\nBlade Break", priceLow: 6.50, priceMid: 9.00, priceMarket: 8.50, priceTrend: 5, tcgplayerUrl: "" },
  // --- Warrior ---
  { id: "dawnblade", name: "Dawnblade", nameCN: "黎明之刃", class: "Warrior", classCN: "战士", type: "Weapon", typeCN: "武器", subtype: "Sword (1H)", rarity: "Majestic", rarityCN: "威严", set: "Welcome to Rathe", setCode: "WTR", cardCode: "WTR004", cost: 1, defense: null, power: 3, intellect: null, life: null, pitch: null, keywords: [], text: "Once per Turn Action — {r}: Attack\n\nWhen Dawnblade hits, it gets +1 power until end of turn.", priceLow: 2.00, priceMid: 3.50, priceMarket: 3.20, priceTrend: 0, tcgplayerUrl: "" },
  { id: "steelblade-shunt", name: "Steelblade Shunt", nameCN: "钢刃转移", class: "Warrior", classCN: "战士", type: "Defense Reaction", typeCN: "防御反应", subtype: null, rarity: "Majestic", rarityCN: "威严", set: "Welcome to Rathe", setCode: "WTR", cardCode: "WTR125", cost: 3, defense: 4, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Target weapon attack gets -2 power.\n\nIf Steelblade Shunt is played from arsenal, the attack gets -4 power instead.", priceLow: 0.50, priceMid: 1.20, priceMarket: 1.00, priceTrend: -2, tcgplayerUrl: "" },
  { id: "courage-of-bladehold", name: "Courage of Bladehold", nameCN: "剑堡之勇", class: "Warrior", classCN: "战士", type: "Attack Action", typeCN: "攻击行动", subtype: null, rarity: "Rare", rarityCN: "稀有", set: "Monarch", setCode: "MON", cardCode: "MON109", cost: 3, defense: 3, power: 5, intellect: null, life: null, pitch: null, keywords: [], text: "If Courage of Bladehold hits, create a Might token.", priceLow: 0.25, priceMid: 0.50, priceMarket: 0.40, priceTrend: 0, tcgplayerUrl: "" },
  // --- Mechanologist ---
  { id: "teklo-plasma-pistol", name: "Teklo Plasma Pistol", nameCN: "泰克洛等离子手枪", class: "Mechanologist", classCN: "机械师", type: "Weapon", typeCN: "武器", subtype: "Gun (2H)", rarity: "Majestic", rarityCN: "威严", set: "Arcane Rising", setCode: "ARC", cardCode: "ARC003", cost: 0, defense: null, power: 2, intellect: null, life: null, pitch: null, keywords: [], text: "Once per Turn Action — {r}{r}{r}: Attack\n\nTeklo Plasma Pistol's attack can't be defended by equipment.", priceLow: 3.00, priceMid: 5.50, priceMarket: 4.80, priceTrend: 8, tcgplayerUrl: "" },
  { id: "high-octane", name: "High Octane", nameCN: "高辛烷值", class: "Mechanologist", classCN: "机械师", type: "Action", typeCN: "行动", subtype: null, rarity: "Majestic", rarityCN: "威严", set: "Arcane Rising", setCode: "ARC", cardCode: "ARC120", cost: 0, defense: 3, power: null, intellect: null, life: null, pitch: null, keywords: ["Go again"], text: "The next Mechanologist action card you play this turn with cost 0 gets go again.\n\nGo again", priceLow: 0.80, priceMid: 1.50, priceMarket: 1.30, priceTrend: 0, tcgplayerUrl: "" },
  { id: "induction-chamber", name: "Induction Chamber", nameCN: "感应舱", class: "Mechanologist", classCN: "机械师", type: "Equipment", typeCN: "装备", subtype: "Head", rarity: "Legendary", rarityCN: "传奇", set: "Arcane Rising", setCode: "ARC", cardCode: "ARC075", cost: 0, defense: 0, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Whenever you boost, Induction Chamber gains +1 defense until end of turn.", priceLow: 15.00, priceMid: 22.00, priceMarket: 20.00, priceTrend: 10, tcgplayerUrl: "" },
  // --- Ranger ---
  { id: "death-dealer", name: "Death Dealer", nameCN: "死神交易者", class: "Ranger", classCN: "游侠", type: "Weapon", typeCN: "武器", subtype: "Bow (2H)", rarity: "Majestic", rarityCN: "威严", set: "Arcane Rising", setCode: "ARC", cardCode: "ARC004", cost: 0, defense: null, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Once per Turn Action — {r}: Put a card from your arsenal on the bottom of your deck, then put the top card of your deck face up into your arsenal.\n\nIf you have an arrow in your arsenal, you may attack with it.", priceLow: 4.00, priceMid: 7.00, priceMarket: 6.20, priceTrend: 3, tcgplayerUrl: "" },
  { id: "red-in-the-ledger", name: "Red in the Ledger", nameCN: "账本上的红字", class: "Ranger", classCN: "游侠", type: "Attack Action", typeCN: "攻击行动", subtype: "Arrow", rarity: "Majestic", rarityCN: "威严", set: "Arcane Rising", setCode: "ARC", cardCode: "ARC130", cost: 1, defense: null, power: 4, intellect: null, life: null, pitch: null, keywords: [], text: "If Red in the Ledger hits, deal 1 damage to target hero.\n\nGo again", priceLow: 1.50, priceMid: 2.80, priceMarket: 2.50, priceTrend: 0, tcgplayerUrl: "" },
  // --- Runeblade ---
  { id: "nebula-blade", name: "Nebula Blade", nameCN: "星云之刃", class: "Runeblade", classCN: "符文之刃", type: "Weapon", typeCN: "武器", subtype: "Sword (1H)", rarity: "Rare", rarityCN: "稀有", set: "Arcane Rising", setCode: "ARC", cardCode: "ARC005", cost: 0, defense: null, power: 1, intellect: null, life: null, pitch: null, keywords: [], text: "Once per Turn Action — {r}: Attack\n\nWhenever you play a 'non-attack' action card, Nebula Blade gets +1 power until end of turn.", priceLow: 0.50, priceMid: 1.00, priceMarket: 0.85, priceTrend: 0, tcgplayerUrl: "" },
  { id: "arknight-ascendancy", name: "Arknight Ascendancy", nameCN: "暗夜骑士升天", class: "Runeblade", classCN: "符文之刃", type: "Attack Action", typeCN: "攻击行动", subtype: null, rarity: "Majestic", rarityCN: "威严", set: "Arcane Rising", setCode: "ARC", cardCode: "ARC155", cost: 2, defense: 3, power: 5, intellect: null, life: null, pitch: null, keywords: [], text: "If Arknight Ascendancy hits, deal 1 arcane damage to target hero.\n\nGo again", priceLow: 1.20, priceMid: 2.00, priceMarket: 1.80, priceTrend: -3, tcgplayerUrl: "" },
  // --- Assassin ---
  { id: "spider-silk-viridian", name: "Spider's Bite", nameCN: "蜘蛛之咬", class: "Assassin", classCN: "刺客", type: "Weapon", typeCN: "武器", subtype: "Dagger (1H)", rarity: "Rare", rarityCN: "稀有", set: "Outsiders", setCode: "OUT", cardCode: "OUT005", cost: 0, defense: null, power: 1, intellect: null, life: null, pitch: null, keywords: [], text: "Once per Turn Action — {r}: Attack\n\nWhen Spider's Bite hits, create a Bloodrot Pox token.", priceLow: 0.40, priceMid: 0.80, priceMarket: 0.70, priceTrend: 0, tcgplayerUrl: "" },
  { id: "leave-no-witnesses", name: "Leave No Witnesses", nameCN: "不留活口", class: "Assassin", classCN: "刺客", type: "Attack Action", typeCN: "攻击行动", subtype: null, rarity: "Majestic", rarityCN: "威严", set: "Outsiders", setCode: "OUT", cardCode: "OUT145", cost: 1, defense: 3, power: 4, intellect: null, life: null, pitch: null, keywords: [], text: "If Leave No Witnesses hits and you have dealt damage with a dagger this combat chain, draw a card.\n\nGo again", priceLow: 0.80, priceMid: 1.50, priceMarket: 1.30, priceTrend: 5, tcgplayerUrl: "" },
  { id: "redback-shroud", name: "Redback Shroud", nameCN: "赤背斗篷", class: "Assassin", classCN: "刺客", type: "Equipment", typeCN: "装备", subtype: "Chest", rarity: "Legendary", rarityCN: "传奇", set: "Outsiders", setCode: "OUT", cardCode: "OUT076", cost: 0, defense: 1, power: null, intellect: null, life: null, pitch: null, keywords: ["Battleworn"], text: "Whenever a hero is dealt damage by a Bloodrot Pox token you control, gain 1 life.\n\nBattleworn", priceLow: 10.00, priceMid: 16.00, priceMarket: 14.50, priceTrend: 7, tcgplayerUrl: "" },
  // --- Illusionist ---
  { id: "phantasmal-footsteps", name: "Phantasmal Footsteps", nameCN: "幻影脚步", class: "Illusionist", classCN: "幻术师", type: "Equipment", typeCN: "装备", subtype: "Legs", rarity: "Legendary", rarityCN: "传奇", set: "Monarch", setCode: "MON", cardCode: "MON082", cost: 0, defense: 0, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Phantasmify (At the beginning of your end phase, if Phantasmal Footsteps is in your equipment zone with no counters, you may put a phantasm counter on it.)", priceLow: 25.00, priceMid: 35.00, priceMarket: 32.00, priceTrend: 12, tcgplayerUrl: "" },
  { id: "spectral-shield", name: "Spectral Shield", nameCN: "幽灵护盾", class: "Illusionist", classCN: "幻术师", type: "Defense Reaction", typeCN: "防御反应", subtype: null, rarity: "Rare", rarityCN: "稀有", set: "Monarch", setCode: "MON", cardCode: "MON090", cost: 0, defense: 4, power: null, intellect: null, life: null, pitch: null, keywords: ["Phantasm"], text: "Phantasm (If Spectral Shield is defended by a non-Illusionist attack action card with 6 or more power, destroy Spectral Shield.)", priceLow: 0.15, priceMid: 0.35, priceMarket: 0.30, priceTrend: 0, tcgplayerUrl: "" },
  // --- MON / ELE / UPR / DYN / DTD / BRI / HVY / MST / ROS / HNT ---
  { id: "luminaris", name: "Luminaris", nameCN: "光明圣器", class: "Illusionist", classCN: "幻术师", type: "Weapon", typeCN: "武器", subtype: "Scepter (1H)", rarity: "Legendary", rarityCN: "传奇", set: "Monarch", setCode: "MON", cardCode: "MON003", cost: 0, defense: null, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Once per Turn Action — {r}{r}: Create a Spectral Shield token.", priceLow: 30.00, priceMid: 42.00, priceMarket: 38.00, priceTrend: 15, tcgplayerUrl: "" },
  { id: "tales-of-adventure", name: "Tales of Adventure", nameCN: "冒险故事", class: "Generic", classCN: "通用", type: "Action", typeCN: "行动", subtype: null, rarity: "Common", rarityCN: "普通", set: "Tales of Aria", setCode: "ELE", cardCode: "ELE200", cost: 1, defense: 3, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Draw a card.\n\nGo again", priceLow: 0.05, priceMid: 0.15, priceMarket: 0.10, priceTrend: 0, tcgplayerUrl: "" },
  { id: "channel-lake-frigid", name: "Channel Lake Frigid", nameCN: "引导冰湖", class: "Runeblade", classCN: "符文之刃", type: "Action", typeCN: "行动", subtype: null, rarity: "Majestic", rarityCN: "威严", set: "Tales of Aria", setCode: "ELE", cardCode: "ELE110", cost: 0, defense: 3, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Deal 2 arcane damage.\n\nIf Channel Lake Frigid was fused, deal 4 arcane damage instead.\n\nGo again", priceLow: 2.50, priceMid: 4.00, priceMarket: 3.50, priceTrend: 5, tcgplayerUrl: "" },
  { id: "crown-of-seeds", name: "Crown of Seeds", nameCN: "种子之冠", class: "Ranger", classCN: "游侠", type: "Equipment", typeCN: "装备", subtype: "Head", rarity: "Legendary", rarityCN: "传奇", set: "Tales of Aria", setCode: "ELE", cardCode: "ELE077", cost: 0, defense: 0, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "At the start of your turn, if you have an arrow in your arsenal, you may put a +1 power counter on it.", priceLow: 18.00, priceMid: 28.00, priceMarket: 25.00, priceTrend: 8, tcgplayerUrl: "" },
  { id: "uprising-red-liner", name: "Uprising", nameCN: "起义", class: "Generic", classCN: "通用", type: "Attack Action", typeCN: "攻击行动", subtype: null, rarity: "Common", rarityCN: "普通", set: "Uprising", setCode: "UPR", cardCode: "UPR200", cost: 1, defense: 3, power: 3, intellect: null, life: null, pitch: null, keywords: [], text: "If Uprising hits a hero that has more life than you, it gets +2 power.", priceLow: 0.05, priceMid: 0.10, priceMarket: 0.08, priceTrend: 0, tcgplayerUrl: "" },
  { id: "dragons-fire", name: "Dragon's Fire", nameCN: "龙之火焰", class: "Generic", classCN: "通用", type: "Instant", typeCN: "瞬发", subtype: null, rarity: "Rare", rarityCN: "稀有", set: "Uprising", setCode: "UPR", cardCode: "UPR150", cost: 0, defense: null, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Target attack action card gets +2 power.\n\nIf it's a draconic card, it also gets go again.", priceLow: 0.30, priceMid: 0.60, priceMarket: 0.50, priceTrend: 0, tcgplayerUrl: "" },
  { id: "imperial-decree", name: "Imperial Decree", nameCN: "帝国法令", class: "Warrior", classCN: "战士", type: "Attack Action", typeCN: "攻击行动", subtype: null, rarity: "Majestic", rarityCN: "威严", set: "Dynasty", setCode: "DYN", cardCode: "DYN135", cost: 4, defense: 3, power: 6, intellect: null, life: null, pitch: null, keywords: ["Dominate"], text: "Dominate\n\nIf Imperial Decree hits, the defending hero can't play or activate instants during the next action phase.", priceLow: 1.00, priceMid: 2.20, priceMarket: 1.80, priceTrend: 0, tcgplayerUrl: "" },
  { id: "eclipse-existence", name: "Eclipse Existence", nameCN: "日蚀存在", class: "Runeblade", classCN: "符文之刃", type: "Attack Action", typeCN: "攻击行动", subtype: null, rarity: "Majestic", rarityCN: "威严", set: "Dusk Till Dawn", setCode: "DTD", cardCode: "DTD120", cost: 3, defense: 3, power: 6, intellect: null, life: null, pitch: null, keywords: [], text: "If Eclipse Existence hits, banish a card from the defending hero's graveyard.\n\nBlood Debt (At the beginning of your end phase, lose 1 life.)", priceLow: 0.60, priceMid: 1.20, priceMarket: 1.00, priceTrend: -3, tcgplayerUrl: "" },
  { id: "symbiosis-shot", name: "Symbiosis Shot", nameCN: "共生射击", class: "Mechanologist", classCN: "机械师", type: "Attack Action", typeCN: "攻击行动", subtype: null, rarity: "Rare", rarityCN: "稀有", set: "Bright Lights", setCode: "BRI", cardCode: "BRI090", cost: 0, defense: 3, power: 3, intellect: null, life: null, pitch: null, keywords: ["Boost"], text: "Boost (As an additional cost to play Symbiosis Shot, you may banish the top card of your deck. If it's a Mechanologist card, Symbiosis Shot gets +3 power.)", priceLow: 0.10, priceMid: 0.25, priceMarket: 0.20, priceTrend: 0, tcgplayerUrl: "" },
  { id: "titan-fist", name: "Titan's Fist", nameCN: "泰坦之拳", class: "Guardian", classCN: "守护者", type: "Attack Action", typeCN: "攻击行动", subtype: null, rarity: "Majestic", rarityCN: "威严", set: "Heavy Hitters", setCode: "HVY", cardCode: "HVY100", cost: 6, defense: 3, power: 9, intellect: null, life: null, pitch: null, keywords: ["Crush"], text: "Crush — If Titan's Fist deals 4 or more damage to a hero, they can't play attack action cards with cost less than 3 during their next action phase.", priceLow: 1.50, priceMid: 3.00, priceMarket: 2.60, priceTrend: 5, tcgplayerUrl: "" },
  { id: "misty-veil", name: "Veil of the Ancestors", nameCN: "祖先之幕", class: "Illusionist", classCN: "幻术师", type: "Action", typeCN: "行动", subtype: null, rarity: "Rare", rarityCN: "稀有", set: "Part the Mistveil", setCode: "MST", cardCode: "MST088", cost: 1, defense: 3, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Create 2 Spectral Shield tokens.\n\nGo again", priceLow: 0.30, priceMid: 0.60, priceMarket: 0.50, priceTrend: 0, tcgplayerUrl: "" },
  { id: "earthlore-surge", name: "Earthlore Surge", nameCN: "地灵涌动", class: "Guardian", classCN: "守护者", type: "Defense Reaction", typeCN: "防御反应", subtype: null, rarity: "Rare", rarityCN: "稀有", set: "Rosetta", setCode: "ROS", cardCode: "ROS095", cost: 1, defense: 5, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "If Earthlore Surge defends an attack with 6 or more power, draw a card.", priceLow: 0.20, priceMid: 0.45, priceMarket: 0.35, priceTrend: 0, tcgplayerUrl: "" },
  { id: "hunt-the-hunted", name: "Hunt the Hunted", nameCN: "猎杀猎人", class: "Ninja", classCN: "忍者", type: "Attack Action", typeCN: "攻击行动", subtype: null, rarity: "Majestic", rarityCN: "威严", set: "The Hunted", setCode: "HNT", cardCode: "HNT120", cost: 1, defense: 3, power: 4, intellect: null, life: null, pitch: null, keywords: ["Go again"], text: "When Hunt the Hunted hits, look at the top card of your deck. You may put it on the bottom.\n\nGo again", priceLow: 2.50, priceMid: 4.50, priceMarket: 4.00, priceTrend: 10, tcgplayerUrl: "" },
  // --- Fabled ---
  { id: "heart-of-fyendal", name: "Heart of Fyendal", nameCN: "费恩达尔之心", class: "Generic", classCN: "通用", type: "Action", typeCN: "行动", subtype: null, rarity: "Fabled", rarityCN: "神话", set: "Welcome to Rathe", setCode: "WTR", cardCode: "WTR000", cost: 0, defense: null, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Gain 4 life.\n\nGo again", priceLow: 180.00, priceMid: 250.00, priceMarket: 230.00, priceTrend: 20, tcgplayerUrl: "" },
  { id: "arknight-shard", name: "Arknight Shard", nameCN: "暗夜碎片", class: "Runeblade", classCN: "符文之刃", type: "Action", typeCN: "行动", subtype: null, rarity: "Fabled", rarityCN: "神话", set: "Arcane Rising", setCode: "ARC", cardCode: "ARC000", cost: 0, defense: null, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Deal 4 arcane damage.\n\nGo again", priceLow: 150.00, priceMid: 200.00, priceMarket: 185.00, priceTrend: 18, tcgplayerUrl: "" },
  // --- More commons/rares for diversity ---
  { id: "sink-below", name: "Sink Below", nameCN: "沉入下方", class: "Generic", classCN: "通用", type: "Defense Reaction", typeCN: "防御反应", subtype: null, rarity: "Common", rarityCN: "普通", set: "Welcome to Rathe", setCode: "WTR", cardCode: "WTR215", cost: 0, defense: 4, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Target attack action card gets -2 power.", priceLow: 0.05, priceMid: 0.15, priceMarket: 0.10, priceTrend: 0, tcgplayerUrl: "" },
  { id: "sigil-of-solace", name: "Sigil of Solace", nameCN: "慰藉之印", class: "Generic", classCN: "通用", type: "Instant", typeCN: "瞬发", subtype: null, rarity: "Common", rarityCN: "普通", set: "Welcome to Rathe", setCode: "WTR", cardCode: "WTR218", cost: 1, defense: null, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Gain 3 life.", priceLow: 0.05, priceMid: 0.10, priceMarket: 0.08, priceTrend: 0, tcgplayerUrl: "" },
  { id: "razor-reflex", name: "Razor Reflex", nameCN: "剃刀反射", class: "Generic", classCN: "通用", type: "Instant", typeCN: "瞬发", subtype: null, rarity: "Common", rarityCN: "普通", set: "Welcome to Rathe", setCode: "WTR", cardCode: "WTR220", cost: 0, defense: null, power: null, intellect: null, life: null, pitch: null, keywords: [], text: "Target attacking action card gets +2 power and gains go again.", priceLow: 0.05, priceMid: 0.10, priceMarket: 0.08, priceTrend: 0, tcgplayerUrl: "" },
  { id: "pummel", name: "Pummel", nameCN: "猛击", class: "Generic", classCN: "通用", type: "Attack Action", typeCN: "攻击行动", subtype: null, rarity: "Common", rarityCN: "普通", set: "Crucible of War", setCode: "CRU", cardCode: "CRU197", cost: 1, defense: 3, power: 4, intellect: null, life: null, pitch: null, keywords: [], text: "If Pummel hits, the defending hero can't play defense reactions this combat chain.", priceLow: 0.10, priceMid: 0.25, priceMarket: 0.20, priceTrend: 0, tcgplayerUrl: "" },
  { id: "harmonized-kodachi", name: "Harmonized Kodachi", nameCN: "和谐小太刀", class: "Ninja", classCN: "忍者", type: "Weapon", typeCN: "武器", subtype: "Sword (1H)", rarity: "Rare", rarityCN: "稀有", set: "Crucible of War", setCode: "CRU", cardCode: "CRU007", cost: 0, defense: null, power: 1, intellect: null, life: null, pitch: null, keywords: [], text: "Once per Turn Action — {r}: Attack\n\nWhen Harmonized Kodachi hits, if you have attacked with a Kodachi this combat chain, the attack gains go again.", priceLow: 0.80, priceMid: 1.50, priceMarket: 1.30, priceTrend: 2, tcgplayerUrl: "" }
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
