import Taro from '@tarojs/taro';
import type { FabCard, ApiResponse, SearchParams } from '../types';

const BASE_URL = 'https://api.fabdb.net';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST';
  data?: Record<string, any>;
}

async function request<T>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || 'Request failed'));
      },
    });
  });
}

export async function searchCards(params: SearchParams): Promise<ApiResponse<FabCard[]>> {
  const queryParams: Record<string, any> = {};

  if (params.keywords) queryParams.keywords = params.keywords;
  if (params.sets) queryParams.sets = params.sets;
  if (params.rarity) queryParams.rarity = params.rarity;
  if (params.type) queryParams.type = params.type;
  if (params.per_page) queryParams.per_page = params.per_page;
  if (params.page) queryParams.page = params.page;

  const queryString = Object.entries(queryParams)
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
    .join('&');

  const url = `${BASE_URL}/cards${queryString ? `?${queryString}` : ''}`;

  return request<ApiResponse<FabCard[]>>({ url });
}

export async function getCardById(identifier: string): Promise<FabCard> {
  const response = await request<ApiResponse<FabCard>>({
    url: `${BASE_URL}/cards/${identifier}`,
  });
  return response.data;
}

export async function getSets(): Promise<any[]> {
  const response = await request<ApiResponse<any[]>>({
    url: `${BASE_URL}/sets`,
  });
  return response.data;
}

export function parseQueryToParams(query: string): SearchParams {
  const params: SearchParams = { per_page: 20, page: 1 };
  const lowerQuery = query.toLowerCase();

  const rarityMap: Record<string, string> = {
    common: 'C',
    rare: 'R',
    majestic: 'M',
    legendary: 'L',
    fabled: 'F',
  };

  for (const [label, code] of Object.entries(rarityMap)) {
    if (lowerQuery.includes(label)) {
      params.rarity = code;
      break;
    }
  }

  const typeMap: Record<string, string> = {
    'attack action': 'attack-action',
    'defense reaction': 'defense-reaction',
    'equipment': 'equipment',
    'weapon': 'weapon',
    'action': 'attack-action',
    'instant': 'instant',
    'aura': 'aura',
    'resource': 'resource',
  };

  for (const [label, type] of Object.entries(typeMap)) {
    if (lowerQuery.includes(label)) {
      params.type = type;
      break;
    }
  }

  const setMap: Record<string, string> = {
    'welcome to rathe': 'WTR',
    'wtr': 'WTR',
    'arcane rising': 'ARC',
    'arc': 'ARC',
    'monarch': 'MON',
    'mon': 'MON',
    'tales of aria': 'ELE',
    'ele': 'ELE',
    'uprising': 'UPR',
    'upr': 'UPR',
    'outsiders': 'OUT',
    'out': 'OUT',
    'dynasty': 'DTD',
    'dtd': 'DTD',
    'everfest': 'EVR',
    'evr': 'EVR',
  };

  for (const [label, code] of Object.entries(setMap)) {
    if (lowerQuery.includes(label)) {
      params.sets = code;
      break;
    }
  }

  params.keywords = query.trim();

  return params;
}

export const SUGGESTION_QUERIES: Array<{ label: string; query: string; params: SearchParams }> = [
  {
    label: 'Majestic equipment',
    query: 'Majestic equipment',
    params: { rarity: 'M', type: 'equipment', per_page: 20 },
  },
  {
    label: 'Fai Ninja cards',
    query: 'Fai Ninja staples',
    params: { keywords: 'fai', per_page: 20 },
  },
  {
    label: 'Legendary weapons',
    query: 'All Legendary weapons',
    params: { rarity: 'L', type: 'weapon', per_page: 20 },
  },
  {
    label: 'Bravo Guardian',
    query: 'Bravo Guardian staples',
    params: { keywords: 'bravo', per_page: 20 },
  },
];
