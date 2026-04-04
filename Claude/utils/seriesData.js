const SERIES = [
  { year: "2025", sets: [
    { code: "SEA", abbr: "HS", name: "High Seas", nameCN: "高海", tags: "Pirate · Necromancer", cards: 236 },
    { code: "HNT", abbr: "HN", name: "The Hunted", nameCN: "猎杀", tags: "Ninja · Warrior · Assassin", cards: 226 },
    { code: "SSM", abbr: "SS", name: "Super Slam", nameCN: "超级猛击", tags: "Supplementary", cards: 120 }
  ]},
  { year: "2024", sets: [
    { code: "ROS", abbr: "RO", name: "Rosetta", nameCN: "罗塞塔", tags: "Earth · Ice · Lightning", cards: 226 },
    { code: "MST", abbr: "PM", name: "Part the Mistveil", nameCN: "拨开迷雾", tags: "Mystic · Illusionist", cards: 226 },
    { code: "HVY", abbr: "HH", name: "Heavy Hitters", nameCN: "重拳出击", tags: "Guardian · Brute", cards: 226 }
  ]},
  { year: "2023", sets: [
    { code: "BRI", abbr: "BL", name: "Bright Lights", nameCN: "璀璨之光", tags: "Mechanologist", cards: 226 },
    { code: "DTD", abbr: "DD", name: "Dusk Till Dawn", nameCN: "黄昏到黎明", tags: "Light · Shadow", cards: 226 },
    { code: "OUT", abbr: "OS", name: "Outsiders", nameCN: "局外人", tags: "Assassin · Ranger · Ninja", cards: 226 }
  ]},
  { year: "2022", sets: [
    { code: "DYN", abbr: "DY", name: "Dynasty", nameCN: "王朝", tags: "Royal · Emperor", cards: 226 },
    { code: "UPR", abbr: "UP", name: "Uprising", nameCN: "起义", tags: "Draconic · Illusionist", cards: 226 },
    { code: "EVE", abbr: "EF", name: "Everfest", nameCN: "永恒庆典", tags: "Multi-class · Carnival", cards: 226 },
    { code: "HIS", abbr: "HP", name: "History Pack 1", nameCN: "历史包1", tags: "Reprint Collection", cards: 227 }
  ]},
  { year: "2021", sets: [
    { code: "ELE", abbr: "TA", name: "Tales of Aria", nameCN: "阿瑞亚传说", tags: "Elemental · Ranger · Guardian", cards: 226 },
    { code: "MON", abbr: "MO", name: "Monarch", nameCN: "君主", tags: "Light · Shadow", cards: 303 }
  ]},
  { year: "2019–2020", sets: [
    { code: "CRU", abbr: "CW", name: "Crucible of War", nameCN: "战争坩埚", tags: "Supplementary", cards: 198 },
    { code: "ARC", abbr: "AR", name: "Arcane Rising", nameCN: "奥术崛起", tags: "Mechanologist · Wizard · Ranger", cards: 226 },
    { code: "WTR", abbr: "WR", name: "Welcome to Rathe", nameCN: "欢迎来到拉斯", tags: "Brute · Guardian · Ninja · Warrior", cards: 226 }
  ]}
];

function getSeriesChronological() {
  return SERIES;
}

function getSeriesAlphabetical() {
  const allSets = [];
  SERIES.forEach(group => {
    group.sets.forEach(s => allSets.push(s));
  });
  allSets.sort((a, b) => a.name.localeCompare(b.name));
  return [{ year: 'A–Z', sets: allSets }];
}

module.exports = {
  SERIES,
  getSeriesChronological,
  getSeriesAlphabetical
};
