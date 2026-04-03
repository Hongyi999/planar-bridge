import { View, Text, Image } from '@tarojs/components';
import type { ITouchEvent } from '@tarojs/components';
import { useState } from 'react';
import type { FabCard } from '../../types';
import './index.scss';

interface CardTileProps {
  card: FabCard;
  index?: number;
  isFavorited?: boolean;
  onPress?: (card: FabCard) => void;
  onFavorite?: (card: FabCard) => void;
}

const RARITY_LABEL: Record<string, string> = {
  L: 'L', M: 'M', R: 'R', C: 'C', T: 'T', F: 'F', P: 'P',
};

const IMG_GRADIENTS = [
  'linear-gradient(135deg, #EBE7DA, #E0DBCC)',
  'linear-gradient(135deg, #E8E4D6, #DDD8C8)',
  'linear-gradient(135deg, #E5E1D2, #DBD6C6)',
  'linear-gradient(135deg, #E9E5D8, #DFD9CA)',
];

function getCardType(card: FabCard): string {
  const parts: string[] = [];
  if (card.class) parts.push(card.class.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  if (card.type) parts.push(card.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  const setCode = card.printings?.[0]?.set?.code || card.set;
  if (setCode) parts.push(setCode.toUpperCase());
  return parts.join(' · ') || '—';
}

export default function CardTile({
  card,
  index = 0,
  isFavorited = false,
  onPress,
  onFavorite,
}: CardTileProps) {
  const [imgError, setImgError] = useState(false);
  const isLM = card.rarity === 'L' || card.rarity === 'M';
  const gradient = IMG_GRADIENTS[index % IMG_GRADIENTS.length];

  const handleFavorite = (e: ITouchEvent) => {
    e.stopPropagation();
    onFavorite?.(card);
  };

  return (
    <View
      className={`ctile ${isLM ? 'ctile--foil' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onPress?.(card)}
    >
      <View className='ctile__img' style={{ background: gradient }}>
        {card.image && !imgError ? (
          <Image
            className='ctile__img-src'
            src={card.image}
            mode='aspectFill'
            onError={() => setImgError(true)}
            lazyLoad
          />
        ) : (
          <View className='ctile__img-ph'>
            <Text className='ctile__img-ph-text'>{card.name}</Text>
          </View>
        )}

        {isLM && <View className='ctile__foil-overlay' />}

        {card.rarity && (
          <View className={`ctile__rbadge ctile__rbadge--${card.rarity}`}>
            <Text className='ctile__rbadge-text'>{RARITY_LABEL[card.rarity] || card.rarity}</Text>
          </View>
        )}

        <View className='ctile__heart' onClick={handleFavorite}>
          {isFavorited ? (
            <Text className='ctile__heart-icon ctile__heart-icon--active'>♥</Text>
          ) : (
            <Text className='ctile__heart-icon'>♡</Text>
          )}
        </View>
      </View>

      <View className='ctile__info'>
        <Text className='ctile__name'>{card.name}</Text>
        <Text className='ctile__meta'>{getCardType(card)}</Text>
        <View className='ctile__price-row'>
          <Text className='ctile__price ctile__price--flat'>Price TBD</Text>
          <Text className='ctile__trend ctile__trend--flat'>—</Text>
        </View>
      </View>
    </View>
  );
}
