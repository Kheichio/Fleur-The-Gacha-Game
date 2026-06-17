import { CHARACTER_POOL, RARITY_WEIGHTS } from '../data/characters';
import type { BannerType, Character, Rarity } from '../types';

export const STANDARD_PULL_COST = 100; // coins
export const ADVENTURE_PULL_COST = 1;  // rubies
export const DUPLICATE_REFUND = 30;    // coins

const ADVENTURE_RATES: Record<Rarity, number> = {
  Common: 40,
  Rare: 40,
  Epic: 15,
  Legendary: 5,
};

function pickRarity(weights: Record<Rarity, number>): Rarity {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of Object.entries(weights) as [Rarity, number][]) {
    if (roll < weight) return rarity;
    roll -= weight;
  }
  return 'Common';
}

function pullWithRates(weights: Record<Rarity, number>): Character {
  const rarity = pickRarity(weights);
  const pool = CHARACTER_POOL.filter((c) => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pullOne(banner: BannerType = 'standard'): Character {
  return pullWithRates(banner === 'adventure' ? ADVENTURE_RATES : RARITY_WEIGHTS);
}

export function pullMany(count: number, banner: BannerType = 'standard'): Character[] {
  return Array.from({ length: count }, () => pullOne(banner));
}
