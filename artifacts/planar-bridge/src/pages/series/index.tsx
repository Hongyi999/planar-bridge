import { View, Text, ScrollView } from '@tarojs/components';
import { useState } from 'react';
import './index.scss';

interface SetItem {
  abbr: string;
  name: string;
  sub: string;
  code: string;
}

interface YearGroup {
  year: string;
  sets: SetItem[];
}

const ALL_SETS: YearGroup[] = [
  {
    year: '2025',
    sets: [
      { abbr: 'HS', name: 'High Seas', sub: 'Pirate · Necromancer · 236 cards', code: 'SEA' },
      { abbr: 'HN', name: 'The Hunted', sub: 'Ninja · Warrior · Assassin · 226 cards', code: 'HNT' },
    ],
  },
  {
    year: '2024',
    sets: [
      { abbr: 'RO', name: 'Rosetta', sub: 'Earth · Ice · Lightning · 226 cards', code: 'ROS' },
      { abbr: 'PM', name: 'Part the Mistveil', sub: 'Mystic · Illusionist · 226 cards', code: 'MST' },
      { abbr: 'HH', name: 'Heavy Hitters', sub: 'Guardian · Brute · 226 cards', code: 'HVY' },
    ],
  },
  {
    year: '2023',
    sets: [
      { abbr: 'BL', name: 'Bright Lights', sub: 'Mechanologist · 226 cards', code: 'BRI' },
      { abbr: 'DD', name: 'Dusk Till Dawn', sub: 'Light · Shadow · 226 cards', code: 'DTD' },
      { abbr: 'OS', name: 'Outsiders', sub: 'Assassin · Ranger · Ninja · 226 cards', code: 'OUT' },
    ],
  },
  {
    year: '2022',
    sets: [
      { abbr: 'DY', name: 'Dynasty', sub: 'Royal · Emperor · 226 cards', code: 'DYN' },
      { abbr: 'UP', name: 'Uprising', sub: 'Draconic · Illusionist · 226 cards', code: 'UPR' },
      { abbr: 'EF', name: 'Everfest', sub: 'Multi-class · Carnival · 226 cards', code: 'EVE' },
    ],
  },
  {
    year: '2021',
    sets: [
      { abbr: 'TA', name: 'Tales of Aria', sub: 'Elemental · Ranger · Guardian · 226 cards', code: 'ELE' },
      { abbr: 'MO', name: 'Monarch', sub: 'Light · Shadow · 303 cards', code: 'MON' },
    ],
  },
  {
    year: '2019 – 2020',
    sets: [
      { abbr: 'CW', name: 'Crucible of War', sub: 'Supplementary · 198 cards', code: 'CRU' },
      { abbr: 'AR', name: 'Arcane Rising', sub: 'Mechanologist · Wizard · Ranger · 226 cards', code: 'ARC' },
      { abbr: 'WR', name: 'Welcome to Rathe', sub: 'Brute · Guardian · Ninja · Warrior · 226 cards', code: 'WTR' },
    ],
  },
];

export default function Series() {
  const [sortMode, setSortMode] = useState<'chrono' | 'alpha'>('chrono');

  const displayGroups = sortMode === 'chrono'
    ? ALL_SETS
    : [{
        year: 'A – Z',
        sets: ALL_SETS
          .flatMap(g => g.sets)
          .sort((a, b) => a.name.localeCompare(b.name)),
      }];

  return (
    <ScrollView className='series-page' scrollY>
      <View className='series-page__header'>
        <Text className='series-page__title'>All Sets</Text>
        <Text className='series-page__sub'>Booster · Supplementary · History · Chronological</Text>
      </View>

      <View className='series-page__toggle'>
        <View
          className={`series-page__toggle-btn ${sortMode === 'chrono' ? 'series-page__toggle-btn--on' : ''}`}
          onClick={() => setSortMode('chrono')}
        >
          <Text className='series-page__toggle-text'>按时间顺序</Text>
        </View>
        <View
          className={`series-page__toggle-btn ${sortMode === 'alpha' ? 'series-page__toggle-btn--on' : ''}`}
          onClick={() => setSortMode('alpha')}
        >
          <Text className='series-page__toggle-text'>按字母顺序</Text>
        </View>
      </View>

      <View className='series-page__list'>
        {displayGroups.map(group => (
          <View key={group.year}>
            <Text className='series-page__year'>{group.year}</Text>
            {group.sets.map(set => (
              <View key={set.code} className='series-page__set-item'>
                <View className='series-page__set-icon'>
                  <Text className='series-page__set-abbr'>{set.abbr}</Text>
                </View>
                <View className='series-page__set-info'>
                  <Text className='series-page__set-name'>{set.name}</Text>
                  <Text className='series-page__set-sub'>{set.sub}</Text>
                </View>
                <Text className='series-page__set-code'>{set.code}</Text>
                <Text className='series-page__set-arrow'>›</Text>
              </View>
            ))}
          </View>
        ))}
        <View className='series-page__bottom-spacer' />
      </View>
    </ScrollView>
  );
}
