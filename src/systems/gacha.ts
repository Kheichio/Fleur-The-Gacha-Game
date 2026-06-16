import { CHARACTER_POOL, RARITY_WEIGHTS } from '../data/characters';
import type { Character, Rarity } from '../types';

export const PULL_COST = 100;
export const DUPLICATE_REFUND = 30;

function pickRarity(): Rarity {
  const total = Object.values(RARITY_WEIGHTS).reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS) as [Rarity, number][]) {
    if (roll < weight) return rarity;
    roll -= weight;
  }
  return 'Common';
}

export function pullOne(): Character {
  const rarity = pickRarity();
  const pool = CHARACTER_POOL.filter((c) => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pullMany(count: number): Character[] {
  return Array.from({ length: count }, () => pullOne());
}
