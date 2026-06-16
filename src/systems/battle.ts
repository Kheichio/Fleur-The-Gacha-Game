import type { BattleUnit, Character } from '../types';

let uidCounter = 0;
function nextUid(): string {
  uidCounter += 1;
  return `unit-${uidCounter}`;
}

export function toBattleUnit(character: Character, isPlayer: boolean): BattleUnit {
  return {
    uid: nextUid(),
    character,
    currentHp: character.stats.hp,
    maxHp: character.stats.hp,
    skillCooldownRemaining: 0,
    isPlayer,
    alive: true,
  };
}

export function buildTurnOrder(units: BattleUnit[]): BattleUnit[] {
  return [...units].sort((a, b) => b.character.stats.speed - a.character.stats.speed);
}

export function calcDamage(attacker: BattleUnit, defender: BattleUnit, multiplier: number): number {
  const raw = attacker.character.stats.atk * multiplier - defender.character.stats.def * 0.5;
  return Math.max(1, Math.round(raw));
}

export function pickTarget(candidates: BattleUnit[]): BattleUnit | undefined {
  const alive = candidates.filter((u) => u.alive);
  if (alive.length === 0) return undefined;
  return alive.reduce((lowest, u) => (u.currentHp < lowest.currentHp ? u : lowest), alive[0]);
}
