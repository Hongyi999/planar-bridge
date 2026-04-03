import { View, Text, ScrollView, Image, Input } from '@tarojs/components';
import type { ITouchEvent } from '@tarojs/components';
import type { BaseEventOrig, InputProps } from '@tarojs/components/types/Input';
import Taro from '@tarojs/taro';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import type { FabList } from '../../types';
import { RarityColors } from '../../constants/colors';
import './index.scss';

export default function Lists() {
  const { state, dispatch } = useApp();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [swipedCardId, setSwipedCardId] = useState<string | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.hydrated && !state.user?.authenticated) {
      Taro.reLaunch({ url: '/pages/welcome/index' });
    }
  }, [state.hydrated, state.user?.authenticated]);

  const selectedList = state.lists.find(l => l.id === selectedListId) || null;

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    dispatch({
      type: 'ADD_LIST',
      payload: {
        id: `list_${Date.now()}`,
        name: newListName.trim(),
        cards: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
    setNewListName('');
    setShowNewListModal(false);
  };

  const handleDeleteList = (listId: string) => {
    Taro.showModal({
      title: 'Delete List',
      content: 'Are you sure you want to delete this list?',
      confirmColor: '#EF4444',
      success(res) {
        if (res.confirm) {
          dispatch({ type: 'DELETE_LIST', payload: listId });
          if (selectedListId === listId) setSelectedListId(null);
        }
      },
    });
  };

  const handleRemoveCard = (cardId: string) => {
    if (!selectedListId) return;
    dispatch({
      type: 'REMOVE_CARD_FROM_LIST',
      payload: { listId: selectedListId, cardId },
    });
    setSwipedCardId(null);
  };

  const handleCardTouchStart = (e: ITouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleCardTouchEnd = (cardId: string, e: ITouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (deltaX < -50) {
      setSwipedCardId(cardId);
    } else if (deltaX > 20 && swipedCardId === cardId) {
      setSwipedCardId(null);
    }
  };

  const exportList = (list: FabList) => {
    const text = [
      `List: ${list.name}`,
      `Cards: ${list.cards.length}`,
      '',
      ...list.cards.map((c, i) => `${i + 1}. ${c.cardName} (${c.cardRarity || '?'})`),
    ].join('\n');

    Taro.setClipboardData({ data: text });
    Taro.showToast({ title: 'Copied to clipboard!', icon: 'success', duration: 2000 });
  };

  return (
    <View className='lists-page'>
      <View className='lists-page__header'>
        <Text className='lists-page__title'>My Lists</Text>
        <View
          className='lists-page__create-btn'
          onClick={() => setShowNewListModal(true)}
        >
          <Text className='lists-page__create-btn-text'>+ New</Text>
        </View>
      </View>

      {state.lists.length === 0 ? (
        <View className='lists-page__empty'>
          <Text className='lists-page__empty-icon'>📚</Text>
          <Text className='lists-page__empty-title'>No lists yet</Text>
          <Text className='lists-page__empty-subtitle'>
            Search for cards and add them to a list to start organizing your collection.
          </Text>
          <View
            className='lists-page__empty-cta'
            onClick={() => Taro.switchTab({ url: '/pages/search/index' })}
          >
            <Text className='lists-page__empty-cta-text'>Go to Search</Text>
          </View>
        </View>
      ) : (
        <View className='lists-page__content'>
          <ScrollView scrollX className='lists-page__list-cards-scroll' showScrollbar={false}>
            <View className='lists-page__list-cards'>
              {state.lists.map(list => (
                <View
                  key={list.id}
                  className={`lists-page__list-card ${selectedListId === list.id ? 'lists-page__list-card--active' : ''}`}
                  onClick={() => setSelectedListId(selectedListId === list.id ? null : list.id)}
                >
                  <View className='lists-page__list-card-icon'>
                    <Text className='lists-page__list-card-icon-text'>
                      {list.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text className='lists-page__list-card-name'>{list.name}</Text>
                  <Text className='lists-page__list-card-count'>{list.cards.length} cards</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {selectedList ? (
            <View className='lists-page__detail'>
              <View className='lists-page__detail-header'>
                <View>
                  <Text className='lists-page__detail-name'>{selectedList.name}</Text>
                  <Text className='lists-page__detail-meta'>
                    {selectedList.cards.length} card{selectedList.cards.length !== 1 ? 's' : ''}
                    {' · '}Value: TBD
                  </Text>
                </View>
                <View className='lists-page__detail-actions'>
                  <View
                    className='lists-page__detail-export'
                    onClick={() => exportList(selectedList)}
                  >
                    <Text className='lists-page__detail-export-text'>Export</Text>
                  </View>
                  <View
                    className='lists-page__detail-delete'
                    onClick={() => handleDeleteList(selectedList.id)}
                  >
                    <Text className='lists-page__detail-delete-text'>Delete</Text>
                  </View>
                </View>
              </View>

              <ScrollView className='lists-page__cards-scroll' scrollY>
                {selectedList.cards.length === 0 ? (
                  <View className='lists-page__cards-empty'>
                    <Text className='lists-page__cards-empty-text'>
                      No cards in this list yet.{'\n'}Search for cards to add them.
                    </Text>
                  </View>
                ) : (
                  <View className='lists-page__cards-list'>
                    {selectedList.cards.map(card => (
                      <View
                        key={card.cardId}
                        className={`lists-page__card-item ${swipedCardId === card.cardId ? 'lists-page__card-item--swiped' : ''}`}
                        onTouchStart={handleCardTouchStart}
                        onTouchEnd={(e: ITouchEvent) => handleCardTouchEnd(card.cardId, e)}
                      >
                        <View
                          className='lists-page__card-item-inner'
                        >
                          {card.cardImage ? (
                            <Image
                              className='lists-page__card-thumb'
                              src={card.cardImage}
                              mode='aspectFill'
                            />
                          ) : (
                            <View className='lists-page__card-thumb-fallback'>
                              <Text className='lists-page__card-thumb-letter'>
                                {card.cardName.charAt(0)}
                              </Text>
                            </View>
                          )}
                          <View className='lists-page__card-info'>
                            <Text className='lists-page__card-name'>{card.cardName}</Text>
                            <View className='lists-page__card-meta'>
                              {card.cardRarity && (
                                <Text
                                  className='lists-page__card-rarity'
                                  style={{ color: RarityColors[card.cardRarity] || '#8E8E93' }}
                                >
                                  {card.cardRarity}
                                </Text>
                              )}
                              <Text className='lists-page__card-price'>Price TBD</Text>
                            </View>
                          </View>
                        </View>
                        {swipedCardId === card.cardId && (
                          <View
                            className='lists-page__card-delete-btn'
                            onClick={() => handleRemoveCard(card.cardId)}
                          >
                            <Text className='lists-page__card-delete-text'>Remove</Text>
                          </View>
                        )}
                      </View>
                    ))}
                    <View className='lists-page__cards-spacer' />
                  </View>
                )}
              </ScrollView>
            </View>
          ) : (
            <View className='lists-page__select-hint'>
              <Text className='lists-page__select-hint-text'>
                Tap a list above to view its cards
              </Text>
            </View>
          )}
        </View>
      )}

      {showNewListModal && (
        <View className='lists-page__modal-overlay' onClick={() => setShowNewListModal(false)}>
          <View className='lists-page__modal' onClick={(e: ITouchEvent) => e.stopPropagation()}>
            <Text className='lists-page__modal-title'>Create New List</Text>
            <Input
              className='lists-page__modal-input'
              placeholder='e.g. Fai Deck, Trade Binder...'
              value={newListName}
              focus
              onInput={(e: BaseEventOrig<InputProps.inputEventDetail>) =>
                setNewListName(e.detail.value)
              }
            />
            <View className='lists-page__modal-actions'>
              <View
                className='lists-page__modal-cancel'
                onClick={() => setShowNewListModal(false)}
              >
                <Text className='lists-page__modal-cancel-text'>Cancel</Text>
              </View>
              <View
                className='lists-page__modal-create'
                onClick={handleCreateList}
              >
                <Text className='lists-page__modal-create-text'>Create</Text>
              </View>
            </View>
          </View>
        </View>
      )}

    </View>
  );
}
