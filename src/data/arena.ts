import { CHARACTER_POOL } from './characters';
import type { Character } from '../types';

export interface ArenaOpponent {
  id: string;
  name: string;
  rank: number;
  team: Character[];
  trophies: number;
}

const ARENA_NAMES = [
  'ShadowBlade', 'FleurFan42', 'DemonSlayer', 'Starweaver', 'IronFist',
  'MoonWhisper', 'BladeStorm', 'CrystalMage', 'NightHawk', 'ThornKnight',
  'SilverArrow', 'GhostWalker', 'FireBrand', 'FrostBite', 'StoneGuard',
  'WindRunner', 'DarkPulse', 'LightBearer', 'WildHeart', 'SteelNerve',
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function scaleStats(char: Character, mult: number): Character {
  return {
    ...char,
    stats: {
      hp: Math.round(char.stats.hp * mult),
      physAtk: Math.round(char.stats.physAtk * mult),
      magAtk: Math.round(char.stats.magAtk * mult),
      physDef: Math.round(char.stats.physDef * mult),
      magDef: Math.round(char.stats.magDef * mult),
      critRate: char.stats.critRate,
      speed: char.stats.speed,
    },
  };
}

export function generateOpponents(playerTrophies: number): ArenaOpponent[] {
  const pool = CHARACTER_POOL;
  return Array.from({ length: 5 }, (_, i) => {
    const trophyRange = Math.max(0, playerTrophies - 200) + Math.floor(Math.random() * 400);
    const difficulty = 1 + (trophyRange / 2000) * 0.8;
    const team = pickRandom(pool, 3).map((c) => scaleStats(c, difficulty));
    const nameIdx = Math.floor(Math.random() * ARENA_NAMES.length);
    return {
      id: `opp-${Date.now()}-${i}`,
      name: ARENA_NAMES[nameIdx],
      rank: Math.max(1, Math.floor(5000 / Math.max(1, trophyRange)) + Math.floor(Math.random() * 50)),
      team,
      trophies: trophyRange,
    };
  });
}

export interface RankTier {
  name: string;
  minTrophies: number;
  color: string;
  icon: string;
  seasonReward: number;
}

export const RANK_TIERS: RankTier[] = [
  { name: 'Bronze',   minTrophies: 0,    color: 'text-amber-600',  icon: '🥉', seasonReward: 5 },
  { name: 'Silver',   minTrophies: 500,  color: 'text-slate-300',  icon: '🥈', seasonReward: 10 },
  { name: 'Gold',     minTrophies: 1200, color: 'text-yellow-400', icon: '🥇', seasonReward: 20 },
  { name: 'Platinum', minTrophies: 2000, color: 'text-cyan-300',   icon: '💠', seasonReward: 35 },
  { name: 'Diamond',  minTrophies: 3500, color: 'text-violet-300', icon: '💎', seasonReward: 50 },
  { name: 'Legend',   minTrophies: 5000, color: 'text-red-400',    icon: '👑', seasonReward: 100 },
];

export function getRankTier(trophies: number): RankTier {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (trophies >= RANK_TIERS[i].minTrophies) return RANK_TIERS[i];
  }
  return RANK_TIERS[0];
}
