export interface FabCard {
  identifier: string;
  name: string;
  pitch?: 1 | 2 | 3 | null;
  cost?: number | null;
  power?: number | null;
  defense?: number | null;
  health?: number | null;
  intelligence?: number | null;
  text?: string | null;
  type: string;
  rarity: 'C' | 'R' | 'M' | 'L' | 'F' | string;
  image?: string | null;
  keywords?: string[];
  sets?: CardSet[];
  printings?: CardPrinting[];
}

export interface CardSet {
  identifier: string;
  name: string;
  code: string;
}

export interface CardPrinting {
  edition?: string;
  id?: string;
  image?: string;
  rarity?: string;
  set?: CardSet;
}

export interface FabList {
  id: string;
  name: string;
  cards: FabListCard[];
  createdAt: number;
  updatedAt: number;
}

export interface FabListCard {
  cardId: string;
  cardName: string;
  cardImage?: string;
  cardRarity?: string;
  cardPitch?: number | null;
  addedAt: number;
}

export interface SearchParams {
  keywords?: string;
  sets?: string;
  rarity?: string;
  type?: string;
  per_page?: number;
  page?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    total: number;
    last_page: number;
    per_page: number;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
}

export interface UserProfile {
  openid?: string;
  nickName: string;
  avatarUrl: string;
  authenticated: boolean;
}

export type ThinkingStep = {
  icon: string;
  text: string;
  status: 'pending' | 'active' | 'done';
};

export type SearchState = 'idle' | 'thinking' | 'results' | 'error';
