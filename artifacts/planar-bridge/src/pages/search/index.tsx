import { View, Text, ScrollView, Image, Input } from '@tarojs/components';
import type { BaseEventOrig, InputProps } from '@tarojs/components/types/Input';
import Taro from '@tarojs/taro';
import { useState, useCallback } from 'react';
import SearchBar from '../../components/SearchBar';
import AgentThinkingStrip from '../../components/AgentThinkingStrip';
import CardTile from '../../components/CardTile';
import SkeletonCard from '../../components/SkeletonCard';
import SuggestionChips from '../../components/SuggestionChips';
import CardDetailModal from '../../components/CardDetailModal';
import { useApp } from '../../store/AppContext';
import { searchCards, parseQueryToParams } from '../../api/fabdb';
import type { FabCard, SearchState, UserProfile } from '../../types';
import './index.scss';

const HERO_CHIPS = [
  { label: 'Legendary 装备', variant: 'gold' },
  { label: 'Majestic 攻击', variant: 'purple' },
  { label: '$5 以下好牌', variant: 'green' },
  { label: 'Uprising 热卡', variant: 'gold' },
];

const LOGO_ICON = require('../../images/logo-icon.png');

export default function Search() {
  const { state, dispatch, openCardDetail, closeCardDetail, addCardToList, createList } = useApp();
  const [query, setQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoritedCards, setFavoritedCards] = useState<Set<string>>(new Set());
  const [heroInput, setHeroInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const isAuthenticated = state.hydrated && state.user?.authenticated;
  const isH5 = process.env.TARO_ENV === 'h5';

  const doLogin = useCallback(async (): Promise<boolean> => {
    if (loginLoading) return false;
    setLoginLoading(true);
    try {
      if (isH5) {
        const user: UserProfile = { nickName: 'Guest Player', avatarUrl: '', authenticated: true };
        dispatch({ type: 'SET_USER', payload: user });
        setLoginLoading(false);
        return true;
      }
      const loginRes = await Taro.login();
      if (!loginRes.code) throw new Error('No code');
      let nickName = 'Player';
      let avatarUrl = '';
      try {
        const profileRes = await Taro.getUserProfile({ desc: '用于显示您的个人信息' });
        nickName = profileRes.userInfo.nickName || 'Player';
        avatarUrl = profileRes.userInfo.avatarUrl || '';
      } catch (_) {}
      const user: UserProfile = { openid: loginRes.code, nickName, avatarUrl, authenticated: true };
      dispatch({ type: 'SET_USER', payload: user });
      setLoginLoading(false);
      return true;
    } catch (err) {
      setLoginLoading(false);
      Taro.showToast({ title: '登录失败，请重试', icon: 'error', duration: 2000 });
      return false;
    }
  }, [loginLoading, isH5, dispatch]);

  const runSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setSearchState('thinking');
    setIsThinking(true);
    setError(null);
    try {
      const params = parseQueryToParams(searchQuery);
      const result = await searchCards(params);
      dispatch({
        type: 'SET_SEARCH_RESULTS',
        payload: { results: result.data || [], query: searchQuery },
      });
    } catch (err) {
      setError('Unable to search cards. Please check your connection.');
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: { results: [], query: searchQuery } });
    }
  }, [dispatch]);

  const handleHeroSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    if (!state.user?.authenticated) {
      const ok = await doLogin();
      if (!ok) return;
    }
    runSearch(q);
  }, [state.user, doLogin, runSearch]);

  const handleHeroChip = useCallback(async (label: string) => {
    if (!state.user?.authenticated) {
      const ok = await doLogin();
      if (!ok) return;
    }
    runSearch(label);
  }, [state.user, doLogin, runSearch]);

  const handleThinkingComplete = useCallback(() => {
    setIsThinking(false);
    setSearchState('results');
  }, []);

  const handleSuggestion = (suggestionQuery: string) => {
    setQuery(suggestionQuery);
    runSearch(suggestionQuery);
  };

  const handleFavorite = (card: FabCard) => {
    setFavoritedCards(prev => {
      const next = new Set(prev);
      if (next.has(card.identifier)) {
        next.delete(card.identifier);
      } else {
        next.add(card.identifier);
        if (state.lists.length === 0) {
          const newList = createList('Favorites');
          addCardToList(newList.id, card);
        } else {
          addCardToList(state.lists[0].id, card);
        }
        Taro.showToast({ title: 'Added to list', icon: 'success', duration: 1500 });
      }
      return next;
    });
  };

  if (!isAuthenticated) {
    return (
      <View className='hero'>
        <View className='hero__bg-lines' />
        <View className='hero__bg-glow' />
        <View className='hero__orb hero__orb--1' />
        <View className='hero__orb hero__orb--2' />
        <View className='hero__orb hero__orb--3' />

        <View className='hero__content'>
          <View className='hero__logo-row'>
            <Image
              className='hero__logo-img'
              src={LOGO_ICON}
              mode='aspectFit'
            />
            <Text className='hero__logo-text'>Planar Bridge</Text>
          </View>

          <Text className='hero__headline'>
            What cards are{'\n'}you looking for?
          </Text>
          <Text className='hero__sub'>
            用自然语言搜索 Flesh and Blood 卡牌{'\n'}实时价格 · 系列浏览 · 个人收藏
          </Text>

          <View className='hero__sbox'>
            <View className='hero__sbox-icon'>
              <View className='hero__search-outer'>
                <View className='hero__search-handle' />
              </View>
            </View>
            <Input
              className='hero__sbox-input'
              placeholderClass='hero__sbox-placeholder'
              placeholder='Legendary equipment for Ninja...'
              value={heroInput}
              onInput={(e: BaseEventOrig<InputProps.inputEventDetail>) => setHeroInput(e.detail.value)}
              confirmType='search'
              onConfirm={() => handleHeroSearch(heroInput)}
            />
          </View>

          <View className='hero__chips'>
            {HERO_CHIPS.map((chip, i) => (
              <View
                key={i}
                className={`hero__chip hero__chip--${chip.variant}`}
                onClick={() => handleHeroChip(chip.label)}
              >
                <Text className='hero__chip-text'>{chip.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text className='hero__legal'>Card data · fabdb.net community database</Text>
      </View>
    );
  }

  const showResults = searchState === 'results' || searchState === 'thinking';

  return (
    <View className='search-page'>
      <View className='search-page__aurora' />
      <View className='search-page__aurora-2' />

      <View className={`search-page__search-area ${showResults ? 'search-page__search-area--compact' : ''}`}>
        {!showResults && (
          <View className='search-page__hero'>
            <Text className='search-page__hero-headline'>
              What cards are{'\n'}you looking for?
            </Text>
          </View>
        )}

        <View className={`search-page__search-bar-wrap ${showResults ? 'search-page__search-bar-wrap--compact' : ''}`}>
          <SearchBar
            value={query}
            onInput={setQuery}
            onSearch={runSearch}
            isCompact={showResults}
            placeholder={showResults ? 'Refine your search...' : 'Describe the cards you want...'}
          />
        </View>

        {!showResults && (
          <View className='search-page__suggestions'>
            <SuggestionChips onSelect={handleSuggestion} />
          </View>
        )}
      </View>

      {showResults && (
        <View className='search-page__results-area'>
          {isThinking || searchState === 'thinking' ? (
            <View className='search-page__thinking-wrap'>
              <AgentThinkingStrip
                visible={searchState === 'thinking'}
                resultCount={state.searchResults.length}
                onComplete={handleThinkingComplete}
              />
            </View>
          ) : null}

          {error && (
            <View className='search-page__error'>
              <Text className='search-page__error-icon'>⚠️</Text>
              <Text className='search-page__error-text'>{error}</Text>
            </View>
          )}

          {searchState === 'results' && (
            <>
              {state.searchResults.length > 0 ? (
                <ScrollView className='search-page__scroll' scrollY enableFlex>
                  <View className='search-page__results-header'>
                    <Text className='search-page__results-count'>
                      {state.searchResults.length} result{state.searchResults.length !== 1 ? 's' : ''}
                    </Text>
                    <Text className='search-page__results-query'>"{state.lastQuery}"</Text>
                  </View>
                  <View className='search-page__grid'>
                    {state.searchResults.map((card, i) => (
                      <CardTile
                        key={card.identifier}
                        card={card}
                        index={i}
                        isFavorited={favoritedCards.has(card.identifier)}
                        onPress={openCardDetail}
                        onFavorite={handleFavorite}
                      />
                    ))}
                  </View>
                  <View className='search-page__grid-bottom-spacer' />
                </ScrollView>
              ) : (
                <View className='search-page__empty'>
                  <Text className='search-page__empty-icon'>🔮</Text>
                  <Text className='search-page__empty-title'>No cards found</Text>
                  <Text className='search-page__empty-subtitle'>
                    Try a different search or browse our suggestions
                  </Text>
                  <View className='search-page__empty-retry' onClick={() => setSearchState('idle')}>
                    <Text className='search-page__empty-retry-text'>← New Search</Text>
                  </View>
                </View>
              )}
            </>
          )}

          {searchState === 'thinking' && (
            <View className='search-page__skeleton-grid'>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))}
            </View>
          )}
        </View>
      )}

      {!showResults && (
        <View className='search-page__empty-state'>
          <View className='search-page__orbit'>
            <Text className='search-page__orbit-symbol'>✦</Text>
          </View>
        </View>
      )}

      <CardDetailModal
        card={state.selectedCard}
        visible={state.isDetailOpen}
        lists={state.lists}
        onClose={closeCardDetail}
        onAddToList={addCardToList}
        onCreateList={createList}
      />
    </View>
  );
}
