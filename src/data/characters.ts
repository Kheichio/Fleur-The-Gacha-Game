import type { Character, Rarity } from '../types';

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  Common: 60,
  Rare: 30,
  Epic: 8,
  Legendary: 2,
};

export const RARITY_COLORS: Record<Rarity, string> = {
  Common: 'border-gray-400 text-gray-200',
  Rare: 'border-blue-400 text-blue-200',
  Epic: 'border-purple-400 text-purple-200',
  Legendary: 'border-yellow-400 text-yellow-200',
};

export const CHARACTER_POOL: Character[] = [
  // Common
  {
    id: 'rose-knight',
    name: 'Rose Knight',
    rarity: 'Common',
    stats: { hp: 120, atk: 18, def: 10, speed: 9 },
    skill: { name: 'Thorn Slash', multiplier: 1.5, cooldown: 2 },
  },
  {
    id: 'daisy-squire',
    name: 'Daisy Squire',
    rarity: 'Common',
    stats: { hp: 130, atk: 15, def: 12, speed: 8 },
    skill: { name: 'Guard Bash', multiplier: 1.4, cooldown: 2 },
  },
  {
    id: 'clover-scout',
    name: 'Clover Scout',
    rarity: 'Common',
    stats: { hp: 100, atk: 20, def: 7, speed: 12 },
    skill: { name: 'Quickstrike', multiplier: 1.5, cooldown: 2 },
  },
  // Rare
  {
    id: 'iris-archer',
    name: 'Iris Archer',
    rarity: 'Rare',
    stats: { hp: 110, atk: 24, def: 9, speed: 13 },
    skill: { name: 'Piercing Shot', multiplier: 1.8, cooldown: 3 },
  },
  {
    id: 'lily-mage',
    name: 'Lily Mage',
    rarity: 'Rare',
    stats: { hp: 95, atk: 28, def: 6, speed: 10 },
    skill: { name: 'Petal Storm', multiplier: 2.0, cooldown: 3 },
  },
  {
    id: 'thorn-berserker',
    name: 'Thorn Berserker',
    rarity: 'Rare',
    stats: { hp: 140, atk: 26, def: 11, speed: 7 },
    skill: { name: 'Bramble Fury', multiplier: 1.9, cooldown: 3 },
  },
  // Epic
  {
    id: 'orchid-duelist',
    name: 'Orchid Duelist',
    rarity: 'Epic',
    stats: { hp: 130, atk: 34, def: 14, speed: 14 },
    skill: { name: 'Bloodbloom Strike', multiplier: 2.3, cooldown: 3 },
  },
  {
    id: 'wisteria-priestess',
    name: 'Wisteria Priestess',
    rarity: 'Epic',
    stats: { hp: 150, atk: 30, def: 16, speed: 9 },
    skill: { name: 'Wisteria Smite', multiplier: 2.2, cooldown: 3 },
  },
  // Legendary
  {
    id: 'fleur-sovereign',
    name: 'Fleur Sovereign',
    rarity: 'Legendary',
    stats: { hp: 170, atk: 40, def: 18, speed: 15 },
    skill: { name: 'Eternal Bloom', multiplier: 2.8, cooldown: 4 },
  },
];
