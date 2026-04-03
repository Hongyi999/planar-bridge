import Taro, { useLoad } from '@tarojs/taro';

export default function Welcome() {
  useLoad(() => {
    Taro.switchTab({ url: '/pages/search/index' });
  });
  return null;
}
