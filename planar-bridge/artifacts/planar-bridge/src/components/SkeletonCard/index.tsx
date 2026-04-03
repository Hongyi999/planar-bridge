import { View } from '@tarojs/components';
import './index.scss';

interface SkeletonCardProps {
  index?: number;
}

export default function SkeletonCard({ index = 0 }: SkeletonCardProps) {
  return (
    <View className='skeleton-card' style={{ animationDelay: `${index * 60}ms` }}>
      <View className='skeleton-card__image' />
      <View className='skeleton-card__body'>
        <View className='skeleton-card__pitch-strip' />
        <View className='skeleton-card__name' />
        <View className='skeleton-card__meta'>
          <View className='skeleton-card__rarity-badge' />
        </View>
        <View className='skeleton-card__price' />
      </View>
    </View>
  );
}
