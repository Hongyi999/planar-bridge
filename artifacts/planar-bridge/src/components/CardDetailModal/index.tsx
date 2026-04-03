import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import type { BaseEventOrig, InputProps } from '@tarojs/components/types/Input';
import { useState } from 'react';
import type { FabCard, FabList } from '../../types';
import { RarityColors, RarityLabels, PitchColors, PitchLabels } from '../../constants/colors';
import './index.scss';

interface CardDetailModalProps {
  card: FabCard | null;
  visible: boolean;
  lists: FabList[];
  onClose: () => void;
  onAddToList: (listId: string, card: FabCard) => void;
  onCreateList: (name: string) => FabList;
}

export default function CardDetailModal({
  card,
  visible,
  lists,
  onClose,
  onAddToList,
  onCreateList,
}: CardDetailModalProps) {
  const [showListPicker, setShowListPicker] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [imgError, setImgError] = useState(false);

  if (!card) return null;

  const rarityColor = RarityColors[card.rarity] || '#8E8E93';
  const pitchColor = card.pitch ? PitchColors[card.pitch] : null;
  const isLegendaryOrMajestic = card.rarity === 'L' || card.rarity === 'M';

  const handleAddToList = (listId: string) => {
    onAddToList(listId, card);
    setShowListPicker(false);
  };

  const handleCreateAndAdd = () => {
    if (!newListName.trim()) return;
    const newList = onCreateList(newListName.trim());
    onAddToList(newList.id, card);
    setNewListName('');
    setShowListPicker(false);
  };

  const formatCardText = (text: string) => {
    return text
      .replace(/\n/g, '\n')
      .replace(/\*\*(.*?)\*\*/g, '$1');
  };

  const stats = [
    { label: 'Cost', value: card.cost },
    { label: 'Power', value: card.power },
    { label: 'Defense', value: card.defense },
    { label: 'Intellect', value: card.intelligence },
    { label: 'Health', value: card.health },
  ].filter(s => s.value !== null && s.value !== undefined);

  return (
    <View className={`card-detail-modal ${visible ? 'card-detail-modal--visible' : ''}`}>
      <View className='card-detail-modal__backdrop' onClick={onClose} />
      <View className={`card-detail-modal__sheet ${visible ? 'card-detail-modal__sheet--open' : ''}`}>
        <View className='card-detail-modal__handle' />

        <ScrollView className='card-detail-modal__scroll' scrollY>
          <View className='card-detail-modal__content'>
            <View className='card-detail-modal__image-section'>
              {card.image && !imgError ? (
                <Image
                  className='card-detail-modal__image'
                  src={card.image}
                  mode='aspectFit'
                  onError={() => setImgError(true)}
                />
              ) : (
                <View className='card-detail-modal__image-fallback'>
                  <Text className='card-detail-modal__image-fallback-text'>
                    {card.name.charAt(0)}
                  </Text>
                </View>
              )}
              {isLegendaryOrMajestic && (
                <View className='card-detail-modal__foil-overlay' />
              )}
            </View>

            <View className='card-detail-modal__info'>
              <View className='card-detail-modal__header'>
                {pitchColor && (
                  <View
                    className='card-detail-modal__pitch-dot'
                    style={{ backgroundColor: pitchColor }}
                  />
                )}
                <Text className='card-detail-modal__name'>{card.name}</Text>
              </View>

              <View className='card-detail-modal__badges'>
                <View
                  className='card-detail-modal__rarity-badge'
                  style={{ borderColor: rarityColor, color: rarityColor }}
                >
                  <Text className='card-detail-modal__badge-text'>
                    {RarityLabels[card.rarity] || card.rarity}
                  </Text>
                </View>
                {card.pitch && (
                  <View
                    className='card-detail-modal__pitch-badge'
                    style={{ borderColor: PitchColors[card.pitch], color: PitchColors[card.pitch] }}
                  >
                    <Text className='card-detail-modal__badge-text'>
                      {PitchLabels[card.pitch]} ({card.pitch})
                    </Text>
                  </View>
                )}
              </View>

              <View className='card-detail-modal__type-row'>
                <Text className='card-detail-modal__type'>
                  {card.type?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>

              {stats.length > 0 && (
                <View className='card-detail-modal__stats'>
                  {stats.map(stat => (
                    <View key={stat.label} className='card-detail-modal__stat-chip'>
                      <Text className='card-detail-modal__stat-label'>{stat.label}</Text>
                      <Text className='card-detail-modal__stat-value'>{stat.value}</Text>
                    </View>
                  ))}
                </View>
              )}

              {card.text && (
                <View className='card-detail-modal__text-section'>
                  <Text className='card-detail-modal__text-label'>Card Text</Text>
                  <Text className='card-detail-modal__card-text'>
                    {formatCardText(card.text)}
                  </Text>
                </View>
              )}

              {card.keywords && card.keywords.length > 0 && (
                <View className='card-detail-modal__keywords'>
                  {card.keywords.map(kw => (
                    <View key={kw} className='card-detail-modal__keyword-chip'>
                      <Text className='card-detail-modal__keyword-text'>{kw}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View className='card-detail-modal__price-section'>
                <View className='card-detail-modal__price-header'>
                  <Text className='card-detail-modal__price-title'>Pricing</Text>
                  <View className='card-detail-modal__price-badge'>
                    <Text className='card-detail-modal__price-badge-text'>via TCGPlayer</Text>
                  </View>
                </View>
                <View className='card-detail-modal__price-note'>
                  <Text className='card-detail-modal__price-note-text'>
                    Live pricing coming soon — TCGPlayer API registration required
                  </Text>
                </View>
              </View>

              {card.printings && card.printings.length > 0 && (
                <View className='card-detail-modal__printings'>
                  <Text className='card-detail-modal__printings-title'>
                    Printings ({card.printings.length})
                  </Text>
                  {card.printings.map((p, i) => (
                    <View key={i} className='card-detail-modal__printing-item'>
                      <View className='card-detail-modal__printing-info'>
                        <Text className='card-detail-modal__printing-set'>
                          {p.set?.name || 'Unknown Set'}
                        </Text>
                        <Text className='card-detail-modal__printing-id'>
                          {p.id || '—'}
                        </Text>
                      </View>
                      <View className='card-detail-modal__printing-rarity'>
                        <Text
                          className='card-detail-modal__printing-rarity-text'
                          style={{ color: RarityColors[p.rarity || ''] || '#8E8E93' }}
                        >
                          {RarityLabels[p.rarity || ''] || p.rarity || '—'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View className='card-detail-modal__actions'>
                <View
                  className='card-detail-modal__add-btn'
                  onClick={() => setShowListPicker(!showListPicker)}
                >
                  <Text className='card-detail-modal__add-btn-text'>
                    {showListPicker ? 'Cancel' : '+ Add to List'}
                  </Text>
                </View>

                {showListPicker && (
                  <View className='card-detail-modal__list-picker'>
                    {lists.length > 0 && (
                      <View className='card-detail-modal__existing-lists'>
                        <Text className='card-detail-modal__picker-label'>Your Lists</Text>
                        {lists.map(list => (
                          <View
                            key={list.id}
                            className='card-detail-modal__list-item'
                            onClick={() => handleAddToList(list.id)}
                          >
                            <Text className='card-detail-modal__list-item-name'>{list.name}</Text>
                            <Text className='card-detail-modal__list-item-count'>
                              {list.cards.length} cards
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <View className='card-detail-modal__new-list'>
                      <Text className='card-detail-modal__picker-label'>Create New List</Text>
                      <View className='card-detail-modal__new-list-input-row'>
                        <Input
                          className='card-detail-modal__new-list-input'
                          placeholder='List name...'
                          value={newListName}
                          onInput={(e: BaseEventOrig<InputProps.inputEventDetail>) =>
                            setNewListName(e.detail.value)
                          }
                        />
                        <View
                          className='card-detail-modal__new-list-create'
                          onClick={handleCreateAndAdd}
                        >
                          <Text className='card-detail-modal__new-list-create-text'>Create</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
