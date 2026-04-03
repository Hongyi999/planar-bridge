import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import './index.scss';

const APP_VERSION = '1.0.0';

interface SettingItem {
  label: string;
  description: string;
  icon: string;
  action: (() => void) | null;
  accent: boolean;
  danger?: boolean;
  readonly?: boolean;
}

export default function Settings() {
  const { state, dispatch } = useApp();
  const { user } = state;

  useEffect(() => {
    if (state.hydrated && !state.user?.authenticated) {
      Taro.reLaunch({ url: '/pages/welcome/index' });
    }
  }, [state.hydrated, state.user?.authenticated]);

  const handleSignOut = () => {
    Taro.showModal({
      title: 'Sign Out',
      content: 'Are you sure you want to sign out?',
      confirmColor: '#EF4444',
      success(res) {
        if (res.confirm) {
          dispatch({ type: 'LOGOUT' });
          Taro.reLaunch({ url: '/pages/welcome/index' });
        }
      },
    });
  };

  const handleClearCache = () => {
    Taro.showModal({
      title: 'Clear Cache',
      content: 'This will clear all saved data including your lists. Continue?',
      confirmColor: '#EF4444',
      success(res) {
        if (res.confirm) {
          try {
            Taro.clearStorageSync();
          } catch (e) {}
          dispatch({ type: 'LOGOUT' });
          Taro.reLaunch({ url: '/pages/welcome/index' });
        }
      },
    });
  };

  const handleExportAllLists = () => {
    const allCards = state.lists.flatMap(l => l.cards);
    const text = [
      '=== PlanarBridge Collections ===',
      '',
      ...state.lists.map(list => [
        `--- ${list.name} (${list.cards.length} cards) ---`,
        ...list.cards.map((c, i) => `${i + 1}. ${c.cardName} [${c.cardRarity || '?'}]`),
        '',
      ].join('\n')),
      `Total: ${allCards.length} cards across ${state.lists.length} list${state.lists.length !== 1 ? 's' : ''}`,
    ].join('\n');

    Taro.setClipboardData({ data: text });
    Taro.showToast({ title: 'Copied all lists!', icon: 'success', duration: 2000 });
  };

  const settingSections: Array<{ title: string; items: SettingItem[] }> = [
    {
      title: 'Collections',
      items: [
        {
          label: 'Export All Lists',
          description: 'Copy all your card lists to clipboard',
          icon: '↗',
          action: handleExportAllLists,
          accent: false,
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          label: 'Card Data Source',
          description: 'fabdb.net community database',
          icon: '○',
          action: null,
          accent: false,
          readonly: true,
        },
        {
          label: 'Pricing Data',
          description: 'TCGPlayer (coming soon)',
          icon: '💰',
          action: null,
          accent: false,
          readonly: true,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Sign Out',
          description: 'Sign out of your account',
          icon: '→',
          action: handleSignOut,
          accent: true,
          danger: true,
        },
        {
          label: 'Clear All Data',
          description: 'Remove all lists and cached data',
          icon: '⊗',
          action: handleClearCache,
          accent: false,
          danger: true,
        },
      ],
    },
  ];

  return (
    <View className='settings-page'>
      <View className='settings-page__header'>
        <Text className='settings-page__title'>Settings</Text>
      </View>

      <View className='settings-page__profile'>
        <View className='settings-page__avatar-wrap'>
          {user?.avatarUrl ? (
            <Image
              className='settings-page__avatar'
              src={user.avatarUrl}
              mode='aspectFill'
            />
          ) : (
            <View className='settings-page__avatar-fallback'>
              <Text className='settings-page__avatar-initial'>
                {(user?.nickName || 'G').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View className='settings-page__profile-info'>
          <Text className='settings-page__profile-name'>
            {user?.nickName || 'Guest Player'}
          </Text>
          <Text className='settings-page__profile-subtitle'>
            {state.lists.length} list{state.lists.length !== 1 ? 's' : ''} · {state.lists.reduce((acc, l) => acc + l.cards.length, 0)} cards tracked
          </Text>
        </View>
      </View>

      {settingSections.map(section => (
        <View key={section.title} className='settings-page__section'>
          <Text className='settings-page__section-title'>{section.title}</Text>
          <View className='settings-page__section-items'>
            {section.items.map((item, i) => (
              <View
                key={i}
                className={`settings-page__item ${item.action ? 'settings-page__item--clickable' : ''} ${item.readonly ? 'settings-page__item--readonly' : ''}`}
                onClick={() => item.action?.()}
              >
                <View className='settings-page__item-left'>
                  <Text
                    className={`settings-page__item-label ${item.danger ? 'settings-page__item-label--danger' : ''}`}
                  >
                    {item.label}
                  </Text>
                  <Text className='settings-page__item-description'>
                    {item.description}
                  </Text>
                </View>
                {item.action && (
                  <Text
                    className={`settings-page__item-arrow ${item.danger ? 'settings-page__item-arrow--danger' : ''}`}
                  >
                    {item.icon}
                  </Text>
                )}
                {item.readonly && (
                  <Text className='settings-page__item-readonly-val'>{item.icon}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}

      <View className='settings-page__footer'>
        <Text className='settings-page__footer-logo'>✦ PlanarBridge</Text>
        <Text className='settings-page__footer-version'>v{APP_VERSION}</Text>
        <Text className='settings-page__footer-note'>
          Card data: fabdb.net · Not affiliated with Legend Story Studios
        </Text>
      </View>

    </View>
  );
}
