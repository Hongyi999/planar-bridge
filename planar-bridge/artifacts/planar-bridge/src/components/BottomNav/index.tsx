import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

interface Tab {
  key: string;
  label: string;
  path: string;
  icon: string;
  activeIcon: string;
}

const TABS: Tab[] = [
  {
    key: 'search',
    label: 'Search',
    path: '/pages/search/index',
    icon: '○',
    activeIcon: '●',
  },
  {
    key: 'lists',
    label: 'Lists',
    path: '/pages/lists/index',
    icon: '☆',
    activeIcon: '★',
  },
  {
    key: 'settings',
    label: 'Settings',
    path: '/pages/settings/index',
    icon: '◎',
    activeIcon: '◉',
  },
];

interface BottomNavProps {
  active: 'search' | 'lists' | 'settings';
}

export default function BottomNav({ active }: BottomNavProps) {
  const handleTabPress = (tab: Tab) => {
    if (tab.key === active) return;
    Taro.reLaunch({ url: tab.path });
  };

  return (
    <View className='bottom-nav'>
      <View className='bottom-nav__inner'>
        {TABS.map(tab => (
          <View
            key={tab.key}
            className={`bottom-nav__tab ${active === tab.key ? 'bottom-nav__tab--active' : ''}`}
            onClick={() => handleTabPress(tab)}
          >
            <View className='bottom-nav__icon-wrap'>
              <Text className='bottom-nav__icon'>
                {active === tab.key ? tab.activeIcon : tab.icon}
              </Text>
            </View>
            <Text className='bottom-nav__label'>{tab.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
