import { View, Text, Button, Image } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { UserProfile } from '../../types';
import './index.scss';

export default function Welcome() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);

  useLoad(() => {
    if (state.user?.authenticated) {
      Taro.switchTab({ url: '/pages/search/index' });
    }
  });

  const handleWeChatLogin = async () => {
    setLoading(true);
    try {
      const loginRes = await Taro.login();
      if (!loginRes.code) {
        throw new Error('Login failed');
      }

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
    <View className='welcome'>
      <View className='welcome__aurora' />
      <View className='welcome__aurora-2' />

      <View className='welcome__content'>
        <View className='welcome__logo'>
          <Text className='welcome__logo-symbol'>✦</Text>
        </View>

        <View className='welcome__title-section'>
          <Text className='welcome__app-name'>PlanarBridge</Text>
          <Text className='welcome__tagline'>
            AI-Powered Flesh and Blood{'\n'}Card Intelligence
          </Text>
        </View>

        <View className='welcome__features'>
          {[
            { icon: '🔍', text: 'Search 12,000+ FAB cards' },
            { icon: '💎', text: 'Browse rarities with foil effects' },
            { icon: '📚', text: 'Manage your collections' },
          ].map((f, i) => (
            <View key={i} className='welcome__feature-item' style={{ animationDelay: `${i * 100 + 400}ms` }}>
              <Text className='welcome__feature-icon'>{f.icon}</Text>
              <Text className='welcome__feature-text'>{f.text}</Text>
            </View>
          ))}
        </View>

        <View className='welcome__actions'>
          {isH5 ? (
            <View className='welcome__preview-btn' onClick={handlePreviewMode}>
              <Text className='welcome__btn-text'>Enter Preview Mode</Text>
              <Text className='welcome__btn-sub'>(WeChat login available in Mini Program)</Text>
            </View>
          ) : (
            <Button
              className={`welcome__wechat-btn ${loading ? 'welcome__wechat-btn--loading' : ''}`}
              onClick={handleWeChatLogin}
              loading={loading}
              disabled={loading}
            >
              <View className='welcome__wechat-btn-content'>
                <Text className='welcome__wechat-icon'>💬</Text>
                <Text className='welcome__btn-text'>
                  {loading ? 'Connecting...' : 'Sign in with WeChat'}
                </Text>
              </View>
            </Button>
          )}
        </View>

        <Text className='welcome__legal'>
          By continuing, you agree to our terms of service.{'\n'}
          Card data provided by fabdb.net community database.
        </Text>
      </View>
    </View>
  );
}
