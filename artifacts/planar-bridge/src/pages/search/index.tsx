import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useCallback, useEffect } from 'react';
import SearchBar from '../../components/SearchBar';
import AgentThinkingStrip from '../../components/AgentThinkingStrip';
import CardTile from '../../components/CardTile';
import SkeletonCard from '../../components/SkeletonCard';
import SuggestionChips from '../../components/SuggestionChips';
import CardDetailModal from '../../components/CardDetailModal';
import { useApp } from '../../store/AppContext';
import { searchCards, parseQueryToParams } from '../../api/fabdb';
import type { FabCard, SearchState } from '../../types';
import './index.scss';

export default function Search() {
  const { state, dispatch, openCardDetail, closeCardDetail, addCardToList, createList } = useApp();
  const [query, setQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoritedCards, setFavoritedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (state.hydrated && !state.user?.authenticated) {
      Taro.reLaunch({ url: '/pages/welcome/index' });
    }
  }, [state.hydrated, state.user?.authenticated]);

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
      dispatch({
        type: 'SET_SEARCH_RESULTS',
        payload: { results: [], query: searchQuery },
      });
    }
  }, [dispatch]);

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
                <ScrollView
                  className='search-page__scroll'
                  scrollY
                  enableFlex
                >
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
