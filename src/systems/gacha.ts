import { CHARACTER_POOL } from '../data/characters';
import { generateRandomItem } from '../data/equipment';
import type { BannerType, Character, PullResult, Rarity } from '../types';

export const STANDARD_PULL_COST  = 100;
export const ADVENTURE_PULL_COST = 1;
export const DEMON_PULL_COST     = 1;
export const BEYOND_PULL_COST    = 1;
export const DUPLICATE_REFUND    = 30;
export const PITY_THRESHOLD      = 100;
export const ITEM_DROP_RATE      = 0.25;

const BANNER_RATES: Record<BannerType, Record<Rarity, number>> = {
  standard:  { Common: 65,   Rare: 28,   Epic: 6.5,  Legendary: 0.5 },
  adventure: { Common: 51,   Rare: 35,   Epic: 13.5, Legendary: 0.5 },
  demon:     { Common: 46.5, Rare: 34,   Epic: 19,   Legendary: 0.5 },
  beyond:    { Common: 46.5, Rare: 34,   Epic: 19,   Legendary: 0.5 },
};

const ALL_STORY_IDS   = ['auxentios-brigach', 'roza-defteros', 'casilda', 'fleur-theos', 'tomoe-yoshimi', 'anwaltin-von-berater'];
const ADVENTURE_FEAT  = ['fleur-theos', 'auxentios-brigach', 'roza-defteros', 'casilda'];
const DEMON_FEAT      = ['tomoe-yoshimi'];
const BEYOND_FEAT     = ['anwaltin-von-berater'];

const BANNER_FEATURED: Record<BannerType, string[]> = {
  standard:  [],
  adventure: ADVENTURE_FEAT,
  demon:     DEMON_FEAT,
  beyond:    BEYOND_FEAT,
};

function getBannerPool(banner: BannerType): Character[] {
  if (banner === 'standard') {
    return CHARACTER_POOL.filter((c) => !ALL_STORY_IDS.includes(c.id));
  }
  if (banner === 'adventure') {
    return CHARACTER_POOL.filter((c) => !DEMON_FEAT.includes(c.id) && !BEYOND_FEAT.includes(c.id));
  }
  if (banner === 'demon') {
    return CHARACTER_POOL.filter((c) => DEMON_FEAT.includes(c.id) || !ALL_STORY_IDS.includes(c.id));
  }
  // beyond: Anwältin + non-story characters
  return CHARACTER_POOL.filter((c) => BEYOND_FEAT.includes(c.id) || !ALL_STORY_IDS.includes(c.id));
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

export function pullOne(banner: BannerType = 'standard', forceLegendary = false): PullResult {
  const rarity = forceLegendary ? 'Legendary' : pickRarity(BANNER_RATES[banner]);

  if (Math.random() < ITEM_DROP_RATE) {
    return { type: 'item', item: generateRandomItem(rarity) };
  }

  const pool     = getBannerPool(banner).filter((c) => c.rarity === rarity);
  const featured = BANNER_FEATURED[banner].filter((id) => pool.some((c) => c.id === id));

  if (featured.length > 0 && Math.random() < 0.5) {
    const featPool = pool.filter((c) => featured.includes(c.id));
    if (featPool.length > 0) return { type: 'character', character: featPool[Math.floor(Math.random() * featPool.length)] };
  }

  const char = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : CHARACTER_POOL[0];
  return { type: 'character', character: char };
}

export function pullMany(count: number, banner: BannerType = 'standard'): PullResult[] {
  return Array.from({ length: count }, () => pullOne(banner));
}
