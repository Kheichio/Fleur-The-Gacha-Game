import type { Character, Stage } from '../types';

function enemy(id: string, name: string, hp: number, physAtk: number, physDef: number, speed: number, skillName = 'Wild Strike', mult = 1.6): Character {
  return {
    id,
    name,
    rarity: 'Common',
    stats: { hp, physAtk, magAtk: 4, physDef, magDef: 4, critRate: 0, speed },
    skill: { name: skillName, multiplier: mult, cooldown: 3 },
  };
}

export const STAGES: Stage[] = [
  {
    id: 'stage-1',
    name: 'Riverside Crossing',
    goldReward: 120,
    enemyTeam: [
      enemy('river-rat-1', 'River Rat', 75, 14, 5, 10, 'Gnaw', 1.4),
      enemy('river-rat-2', 'River Rat', 75, 14, 5, 10, 'Gnaw', 1.4),
      enemy('river-thug', 'Bridge Thug', 100, 18, 8, 8, 'Club Swing', 1.6),
    ],
  },
  {
    id: 'stage-2',
    name: 'Abandoned Farmstead',
    goldReward: 160,
    enemyTeam: [
      enemy('feral-hound-1', 'Feral Hound', 90, 17, 7, 12, 'Lunge', 1.5),
      enemy('feral-hound-2', 'Feral Hound', 90, 17, 7, 12, 'Lunge', 1.5),
      enemy('squatter', 'Desperate Squatter', 120, 20, 10, 9, 'Rusted Slash', 1.7),
    ],
  },
  {
    id: 'stage-3',
    name: 'Broken Watchtower',
    goldReward: 200,
    enemyTeam: [
      enemy('tower-ghost-1', 'Tower Shade', 130, 22, 10, 11, 'Spectral Claw', 1.7),
      enemy('tower-ghost-2', 'Tower Shade', 130, 22, 10, 11, 'Spectral Claw', 1.7),
      enemy('tower-knight', 'Fallen Knight', 160, 26, 14, 10, 'Phantom Cleave', 2.0),
    ],
  },
  {
    id: 'stage-4',
    name: 'Hollow Shrine',
    goldReward: 250,
    enemyTeam: [
      enemy('shrine-wisp-1', 'Shrine Wisp', 110, 16, 8, 15, 'Soul Flare', 1.8),
      enemy('shrine-wisp-2', 'Shrine Wisp', 110, 16, 8, 15, 'Soul Flare', 1.8),
      enemy('shrine-guardian', 'Shrine Guardian', 190, 28, 16, 11, 'Divine Wrath', 2.2),
    ],
  },
  {
    id: 'stage-5',
    name: 'Gates of Bypethenos',
    goldReward: 320,
    enemyTeam: [
      enemy('gate-sentry-1', 'Gate Sentry', 180, 28, 15, 12, 'Halberd Thrust', 1.9),
      enemy('gate-sentry-2', 'Gate Sentry', 180, 28, 15, 12, 'Halberd Thrust', 1.9),
      enemy('gate-captain', 'Gate Captain', 220, 34, 18, 13, 'Authority Strike', 2.3),
    ],
  },
];
