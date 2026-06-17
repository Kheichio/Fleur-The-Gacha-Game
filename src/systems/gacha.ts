import { CHARACTER_POOL } from '../data/characters';
import type { BannerType, Character, Rarity } from '../types';

export const STANDARD_PULL_COST  = 100; // coins
export const ADVENTURE_PULL_COST = 1;   // rubies
export const DEMON_PULL_COST     = 1;   // rubies
export const DUPLICATE_REFUND    = 30;  // coins

const BANNER_RATES: Record<BannerType, Record<Rarity, number>> = {
  standard:  { Common: 60, Rare: 30, Epic: 8,  Legendary: 2 },
  adventure: { Common: 40, Rare: 40, Epic: 15, Legendary: 5 },
  demon:     { Common: 35, Rare: 38, Epic: 22, Legendary: 5 },
};

// Story characters that belong to specific banners only
const ALL_STORY_IDS   = ['auxentios-brigach', 'roza-defteros', 'casilda', 'fleur-theos', 'tomoe-yoshimi'];
const ADVENTURE_FEAT  = ['fleur-theos', 'auxentios-brigach', 'roza-defteros', 'casilda'];
const DEMON_FEAT      = ['tomoe-yoshimi'];

const BANNER_FEATURED: Record<BannerType, string[]> = {
  standard:  [],
  adventure: ADVENTURE_FEAT,
  demon:     DEMON_FEAT,
};

function getBannerPool(banner: BannerType): Character[] {
  if (banner === 'standard') {
    // Standard: no story characters at all
    return CHARACTER_POOL.filter((c) => !ALL_STORY_IDS.includes(c.id));
  }
  if (banner === 'adventure') {
    // Adventure: all characters except Tomoe (Demon-exclusive)
    return CHARACTER_POOL.filter((c) => !DEMON_FEAT.includes(c.id));
  }
  // Demon: Tomoe + non-story characters (no other story chars)
  return CHARACTER_POOL.filter((c) => DEMON_FEAT.includes(c.id) || !ALL_STORY_IDS.includes(c.id));
}

function pickRarity(weights: Record<Rarity, number>): Rarity {
  const total = Object.values(weights).reduce((s, w) => s + w, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of Object.entries(weights) as [Rarity, number][]) {
    if (roll < weight) return rarity;
    roll -= weight;
  }
  return 'Common';
}

export function pullOne(banner: BannerType = 'standard'): Character {
  const rarity   = pickRarity(BANNER_RATES[banner]);
  const pool     = getBannerPool(banner).filter((c) => c.rarity === rarity);
  const featured = BANNER_FEATURED[banner].filter((id) => pool.some((c) => c.id === id));

  if (featured.length > 0 && Math.random() < 0.5) {
    const featPool = pool.filter((c) => featured.includes(c.id));
    if (featPool.length > 0) return featPool[Math.floor(Math.random() * featPool.length)];
  }

  return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : CHARACTER_POOL[0];
}

export function pullMany(count: number, banner: BannerType = 'standard'): Character[] {
  return Array.from({ length: count }, () => pullOne(banner));
}
