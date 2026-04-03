import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';
import type { FabCard, FabList, FabListCard, UserProfile } from '../types';

interface AppState {
  user: UserProfile | null;
  lists: FabList[];
  searchResults: FabCard[];
  lastQuery: string;
  selectedCard: FabCard | null;
  isDetailOpen: boolean;
  hydrated: boolean;
}

type Action =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'LOGOUT' }
  | { type: 'SET_SEARCH_RESULTS'; payload: { results: FabCard[]; query: string } }
  | { type: 'SET_SELECTED_CARD'; payload: FabCard | null }
  | { type: 'SET_DETAIL_OPEN'; payload: boolean }
  | { type: 'ADD_LIST'; payload: FabList }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'ADD_CARD_TO_LIST'; payload: { listId: string; card: FabListCard } }
  | { type: 'REMOVE_CARD_FROM_LIST'; payload: { listId: string; cardId: string } }
  | { type: 'LOAD_LISTS'; payload: FabList[] }
  | { type: 'SET_HYDRATED' };

const initialState: AppState = {
  user: null,
  lists: [],
  searchResults: [],
  lastQuery: '',
  selectedCard: null,
  isDetailOpen: false,
  hydrated: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'LOGOUT':
      return { ...state, user: null };

    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload.results,
        lastQuery: action.payload.query,
      };

    case 'SET_SELECTED_CARD':
      return { ...state, selectedCard: action.payload };

    case 'SET_DETAIL_OPEN':
      return { ...state, isDetailOpen: action.payload };

    case 'LOAD_LISTS':
      return { ...state, lists: action.payload };

    case 'SET_HYDRATED':
      return { ...state, hydrated: true };

    case 'ADD_LIST': {
      const newLists = [...state.lists, action.payload];
      saveLists(newLists);
      return { ...state, lists: newLists };
    }

    case 'DELETE_LIST': {
      const newLists = state.lists.filter(l => l.id !== action.payload);
      saveLists(newLists);
      return { ...state, lists: newLists };
    }

    case 'ADD_CARD_TO_LIST': {
      const newLists = state.lists.map(list => {
        if (list.id !== action.payload.listId) return list;
        const alreadyIn = list.cards.some(c => c.cardId === action.payload.card.cardId);
        if (alreadyIn) return list;
        return {
          ...list,
          cards: [...list.cards, action.payload.card],
          updatedAt: Date.now(),
        };
      });
      saveLists(newLists);
      return { ...state, lists: newLists };
    }

    case 'REMOVE_CARD_FROM_LIST': {
      const newLists = state.lists.map(list => {
        if (list.id !== action.payload.listId) return list;
        return {
          ...list,
          cards: list.cards.filter(c => c.cardId !== action.payload.cardId),
          updatedAt: Date.now(),
        };
      });
      saveLists(newLists);
      return { ...state, lists: newLists };
    }

    default:
      return state;
  }
}

function saveLists(lists: FabList[]) {
  try {
    Taro.setStorageSync('pb_lists', JSON.stringify(lists));
  } catch (e) {}
}

function loadLists(): FabList[] {
  try {
    const raw = Taro.getStorageSync('pb_lists');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function loadUser(): UserProfile | null {
  try {
    const raw = Taro.getStorageSync('pb_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveUser(user: UserProfile | null) {
  try {
    if (user) {
      Taro.setStorageSync('pb_user', JSON.stringify(user));
    } else {
      Taro.removeStorageSync('pb_user');
    }
  } catch (e) {}
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addCardToList: (listId: string, card: FabCard) => void;
  createList: (name: string) => FabList;
  openCardDetail: (card: FabCard) => void;
  closeCardDetail: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const savedLists = loadLists();
    if (savedLists.length > 0) {
      dispatch({ type: 'LOAD_LISTS', payload: savedLists });
    }
    const savedUser = loadUser();
    if (savedUser) {
      dispatch({ type: 'SET_USER', payload: savedUser });
    }
    dispatch({ type: 'SET_HYDRATED' });
  }, []);

  useEffect(() => {
    saveUser(state.user);
  }, [state.user]);

  const addCardToList = useCallback((listId: string, card: FabCard) => {
    const listCard: FabListCard = {
      cardId: card.identifier,
      cardName: card.name,
      cardImage: card.image || undefined,
      cardRarity: card.rarity,
      cardPitch: card.pitch,
      addedAt: Date.now(),
    };
    dispatch({ type: 'ADD_CARD_TO_LIST', payload: { listId, card: listCard } });
  }, []);

  const createList = useCallback((name: string): FabList => {
    const newList: FabList = {
      id: `list_${Date.now()}`,
      name,
      cards: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'ADD_LIST', payload: newList });
    return newList;
  }, []);

  const openCardDetail = useCallback((card: FabCard) => {
    dispatch({ type: 'SET_SELECTED_CARD', payload: card });
    dispatch({ type: 'SET_DETAIL_OPEN', payload: true });
  }, []);

  const closeCardDetail = useCallback(() => {
    dispatch({ type: 'SET_DETAIL_OPEN', payload: false });
    setTimeout(() => {
      dispatch({ type: 'SET_SELECTED_CARD', payload: null });
    }, 300);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, addCardToList, createList, openCardDetail, closeCardDetail }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
