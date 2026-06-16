import type { Character, Stage } from '../types';

function enemy(id: string, name: string, hp: number, atk: number, def: number, speed: number): Character {
  return {
    id,
    name,
    rarity: 'Common',
    stats: { hp, atk, def, speed },
    skill: { name: 'Wild Strike', multiplier: 1.6, cooldown: 3 },
  };
}

export const STAGES: Stage[] = [
  {
    id: 'stage-1',
    name: 'Wilted Meadow',
    goldReward: 120,
    enemyTeam: [
      enemy('wilted-sprout-1', 'Wilted Sprout', 80, 14, 6, 8),
      enemy('wilted-sprout-2', 'Wilted Sprout', 80, 14, 6, 8),
      enemy('wilted-sprout-3', 'Wilted Sprout', 80, 14, 6, 8),
    ],
  },
  {
    id: 'stage-2',
    name: 'Bramble Hollow',
    goldReward: 160,
    enemyTeam: [
      enemy('bramble-fiend-1', 'Bramble Fiend', 110, 18, 9, 10),
      enemy('bramble-fiend-2', 'Bramble Fiend', 110, 18, 9, 10),
      enemy('bramble-fiend-3', 'Bramble Fiend', 110, 18, 9, 10),
    ],
  },
  {
    id: 'stage-3',
    name: 'Thorned Ruins',
    goldReward: 200,
    enemyTeam: [
      enemy('ruin-stalker-1', 'Ruin Stalker', 140, 22, 12, 11),
      enemy('ruin-stalker-2', 'Ruin Stalker', 140, 22, 12, 11),
      enemy('ruin-stalker-3', 'Ruin Stalker', 140, 22, 12, 11),
    ],
  },
  {
    id: 'stage-4',
    name: 'Withering Spire',
    goldReward: 250,
    enemyTeam: [
      enemy('spire-wraith-1', 'Spire Wraith', 170, 27, 14, 13),
      enemy('spire-wraith-2', 'Spire Wraith', 170, 27, 14, 13),
      enemy('spire-wraith-3', 'Spire Wraith', 170, 27, 14, 13),
    ],
  },
  {
    id: 'stage-5',
    name: "Sovereign's Bloomguard",
    goldReward: 320,
    enemyTeam: [
      enemy('bloomguard-1', 'Bloomguard', 200, 32, 17, 14),
      enemy('bloomguard-2', 'Bloomguard', 200, 32, 17, 14),
      enemy('bloomguard-3', 'Bloomguard', 200, 32, 17, 14),
    ],
  },
];
