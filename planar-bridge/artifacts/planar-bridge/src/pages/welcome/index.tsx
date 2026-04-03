import { View, Text, Input } from '@tarojs/components';
import type { BaseEventOrig, InputProps } from '@tarojs/components/types/Input';
import Taro, { useLoad } from '@tarojs/taro';
import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { UserProfile } from '../../types';
import './index.scss';

const CHIPS = [
  { label: 'Legendary 装备', variant: 'gold' },
  { label: 'Majestic 攻击', variant: 'purple' },
  { label: '$5 以下好牌', variant: 'green' },
  { label: 'Uprising 热卡', variant: 'gold' },
];

export default function Welcome() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useLoad(() => {
    if (state.user?.authenticated) {
      Taro.switchTab({ url: '/pages/search/index' });
    }
  });

  const handleWeChatLogin = async () => {
    setLoading(true);
    try {
      const loginRes = await Taro.login();
      if (!loginRes.code) throw new Error('Login failed');
      const profileRes = await Taro.getUserProfile({ desc: 'Used to display your profile' });
      const { nickName, avatarUrl } = profileRes.userInfo;
      const user: UserProfile = {
        openid: loginRes.code,
        nickName: nickName || 'Player',
        avatarUrl: avatarUrl || '',
        authenticated: true,
      };
      dispatch({ type: 'SET_USER', payload: user });
      Taro.switchTab({ url: '/pages/search/index' });
    } catch (err) {
      setLoading(false);
      Taro.showToast({ title: 'Login failed, please try again', icon: 'error', duration: 2000 });
    }
  };

  const handlePreviewMode = () => {
    const user: UserProfile = {
      nickName: 'Guest Player',
      avatarUrl: '',
      authenticated: true,
    };
    dispatch({ type: 'SET_USER', payload: user });
    Taro.switchTab({ url: '/pages/search/index' });
  };

  const isH5 = process.env.TARO_ENV === 'h5';

  return (
    <View className='hero'>
      <View className='hero__bg-lines' />
      <View className='hero__bg-glow' />
      <View className='hero__orb hero__orb--1' />
      <View className='hero__orb hero__orb--2' />
      <View className='hero__orb hero__orb--3' />

      <View className='hero__content'>
        <View className='hero__logo-row'>
          <View className='hero__logo-icon'>
            <View className='hero__logo-diamond' />
          </View>
          <Text className='hero__logo-text'>Planar Bridge</Text>
        </View>

        <Text className='hero__headline'>What cards are{'\n'}you looking for?</Text>
        <Text className='hero__sub'>
          用自然语言搜索 Flesh and Blood 卡牌{'\n'}实时价格 · 系列浏览 · 个人收藏
        </Text>

        <View className='hero__sbox'>
          <View className='hero__sbox-icon'>
            <View className='hero__search-circle' />
          </View>
          <Input
            className='hero__sbox-input'
            placeholderClass='hero__sbox-placeholder'
            placeholder='Legendary equipment for Ninja...'
            value={searchText}
            onInput={(e: BaseEventOrig<InputProps.inputEventDetail>) => setSearchText(e.detail.value)}
            confirmType='search'
            onConfirm={handlePreviewMode}
          />
        </View>

        <View className='hero__chips'>
          {CHIPS.map((chip, i) => (
            <View
              key={i}
              className={`hero__chip hero__chip--${chip.variant}`}
              onClick={handlePreviewMode}
            >
              <Text className='hero__chip-text'>{chip.label}</Text>
            </View>
          ))}
        </View>

        <View className='hero__actions'>
          {isH5 ? (
            <View className='hero__enter-btn' onClick={handlePreviewMode}>
              <Text className='hero__enter-btn-text'>进入 Preview 模式</Text>
            </View>
          ) : (
            <View
              className={`hero__wechat-btn ${loading ? 'hero__wechat-btn--loading' : ''}`}
              onClick={loading ? undefined : handleWeChatLogin}
            >
              <Text className='hero__wechat-btn-text'>
                {loading ? '连接中...' : '微信登录'}
              </Text>
            </View>
          )}
        </View>

        <Text className='hero__legal'>
          Card data · fabdb.net community database
        </Text>
      </View>
    </View>
  );
}
