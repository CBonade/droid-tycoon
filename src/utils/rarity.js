export const RARITY_ORDER = ['base', 'gold', 'diamond', 'rainbow', 'beskar']

export function maxRarity(rarities) {
  const best = Math.max(...rarities.map(r => RARITY_ORDER.indexOf(r)))
  return RARITY_ORDER[best]
}

export const RARITY_LABEL = {
  base:    'Base',
  gold:    'Gold',
  diamond: 'Diamond',
  rainbow: 'Rainbow',
  beskar:  'Beskar',
}

export const RARITY_STYLES = {
  base: {
    badge: 'bg-gray-600 text-gray-200',
    glow:  '',
  },
  gold: {
    badge: 'bg-amber-500 text-amber-950 font-bold shadow-rarity-gold',
    glow:  'shadow-rarity-gold',
  },
  diamond: {
    badge: 'bg-cyan-400 text-cyan-950 font-bold shadow-rarity-diamond',
    glow:  'shadow-rarity-diamond',
  },
  rainbow: {
    badge: 'rainbow-badge text-gray-900 font-bold shadow-rarity-rainbow',
    glow:  'shadow-rarity-rainbow',
  },
  beskar: {
    badge: 'beskar-badge text-slate-900 font-bold shadow-rarity-beskar',
    glow:  'shadow-rarity-beskar',
  },
}

export const CYCLE_IDENTIFIERS = {
  1: ['CB', 'PIT', 'DRK-1 PROBE'],
  2: ['MOUSE', 'GONK', 'ID10'],
  3: ['MOUSE', 'PIT', 'GONK'],
  4: ['ID10', 'PIT', 'DRK-1 PROBE'],
}

export const STEP_COSTS = {
  1: '10K',   2: '150K',  3: '975K',  4: '2.95M',
  5: '5.35M', 6: '9.85M', 7: '14.5M', 8: '36M',
  9: '89M',   10: '220M', 11: '550M', 12: '1.36B',
  13: '3.4B', 14: '8.45B',15: '21B',  16: '52B',
  17: '130B', 18: '325B', 19: '810B', 20: '2T',
  21: '3T',   22: '4.5T', 23: '6T',
}


export const MIN_STEP = 1
export const MAX_STEP = 23
export const DEFAULT_TARGET = 20

export const MIN_CURRENT = 0
export const DEFAULT_CURRENT = 0
