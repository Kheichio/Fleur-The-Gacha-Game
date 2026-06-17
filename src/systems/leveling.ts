import type { Stats } from '../types';

export const MAX_LEVEL = 50;
export const TRAIN_COST = 500;   // coins per training session
export const TRAIN_XP = 50;      // XP gained per training session

export function xpForLevel(level: number): number {
  return level * 100;
}

export function totalXpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForLevel(l);
  return total;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xp >= totalXpForLevel(level + 1)) level++;
  return level;
}

export function xpProgress(xp: number): { level: number; current: number; needed: number } {
  const level = levelFromXp(xp);
  if (level >= MAX_LEVEL) return { level, current: 0, needed: 0 };
  const base = totalXpForLevel(level);
  const next = totalXpForLevel(level + 1);
  return { level, current: xp - base, needed: next - base };
}

export function effectiveStats(base: Stats, level: number, enhancement: number): Stats {
  const lv = Math.max(1, Math.min(MAX_LEVEL, level));
  const enh = Math.max(0, Math.min(5, enhancement));
  const mult = 1 + (lv - 1) * 0.06 + enh * 0.12;
  return {
    hp: Math.round(base.hp * mult),
    atk: Math.round(base.atk * mult),
    def: Math.round(base.def * mult),
    speed: base.speed + Math.floor(lv / 10),
  };
}
