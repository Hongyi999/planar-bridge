import { View, Text, Image } from '@tarojs/components';
import { useState } from 'react';
import type { FabCard } from '../../types';
import { RarityColors, RarityLabels, PitchColors } from '../../constants/colors';
import './index.scss';

interface CardTileProps {
  card: FabCard;
  index?: number;
  isFavorited?: boolean;
  onPress?: (card: FabCard) => void;
  onFavorite?: (card: FabCard) => void;
}

export default function CardTile({
  card,
  index = 0,
  isFavorited = false,
  onPress,
  onFavorite,
}: CardTileProps) {
  const [imgError, setImgError] = useState(false);
  const [pressed, setPressed] = useState(false);

  const rarityColor = RarityColors[card.rarity] || '#8E8E93';
  const pitchColor = card.pitch ? PitchColors[card.pitch] : null;
  const isLegendaryOrMajestic = card.rarity === 'L' || card.rarity === 'F';

  const handlePress = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    onPress?.(card);
  };

  const handleFavorite = (e: any) => {
    e.stopPropagation?.();
    onFavorite?.(card);
  };

  return (
    <View
      className={`card-tile ${pressed ? 'card-tile--pressed' : ''} ${isLegendaryOrMajestic ? 'card-tile--foil' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={handlePress}
    >
      {pitchColor && (
        <View
          className='card-tile__pitch-strip'
          style={{ backgroundColor: pitchColor }}
        />
      )}

      <View className='card-tile__image-wrap'>
        {card.image && !imgError ? (
          <Image
            className='card-tile__image'
            src={card.image}
            mode='aspectFill'
            onError={() => setImgError(true)}
            lazyLoad
          />
        ) : (
          <View className='card-tile__image-fallback'>
            <Text className='card-tile__image-fallback-text'>
              {card.name.charAt(0)}
            </Text>
          </View>
        )}
        {isLegendaryOrMajestic && (
          <View className='card-tile__foil-overlay' />
        )}
        <View className='card-tile__favorite' onClick={handleFavorite}>
          <Text className={`card-tile__favorite-icon ${isFavorited ? 'card-tile__favorite-icon--active' : ''}`}>
            {isFavorited ? '♥' : '♡'}
          </Text>
        </View>
      </View>

      <View className='card-tile__body'>
        <View className='card-tile__meta'>
          <View
            className='card-tile__rarity-badge'
            style={{ color: rarityColor, borderColor: rarityColor }}
          >
            <Text className='card-tile__rarity-text'>
              {RarityLabels[card.rarity] || card.rarity}
            </Text>
          </View>
        </View>
        <Text className='card-tile__name'>{card.name}</Text>
        <View className='card-tile__price-row'>
          <Text className='card-tile__price'>Price TBD</Text>
        </View>
      </View>
    </View>
  );
}
