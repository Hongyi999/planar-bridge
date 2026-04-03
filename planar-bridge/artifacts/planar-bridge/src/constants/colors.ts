export const Colors = {
  bgPrimary: '#0A0A0C',
  bgSecondary: '#141418',
  bgTertiary: '#1E1E24',
  accentPrimary: '#E8A838',
  accentSecondary: '#C06AE0',
  accentSuccess: '#34D399',
  accentDanger: '#EF4444',
  textPrimary: '#F5F5F7',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',
  rarityCommon: '#B0B0B0',
  rarityRare: '#3B82F6',
  rarityMajestic: '#F59E0B',
  rarityLegendary: '#EC4899',
  rarityFabled: '#8B5CF6',
  pitchRed: '#EF4444',
  pitchYellow: '#F59E0B',
  pitchBlue: '#3B82F6',
  pitchNone: '#48484A',
  glassBackground: 'rgba(20, 20, 24, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
} as const;

export const RarityColors: Record<string, string> = {
  C: Colors.rarityCommon,
  R: Colors.rarityRare,
  M: Colors.rarityMajestic,
  L: Colors.rarityLegendary,
  F: Colors.rarityFabled,
};

export const PitchColors: Record<number, string> = {
  1: Colors.pitchRed,
  2: Colors.pitchYellow,
  3: Colors.pitchBlue,
};

export const RarityLabels: Record<string, string> = {
  C: 'Common',
  R: 'Rare',
  M: 'Majestic',
  L: 'Legendary',
  F: 'Fabled',
};

export const PitchLabels: Record<number, string> = {
  1: 'Red',
  2: 'Yellow',
  3: 'Blue',
};
