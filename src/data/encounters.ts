import type { Character, Stage } from '../types';

function foe(
  id: string,
  name: string,
  hp: number,
  physAtk: number,
  physDef: number,
  speed: number,
  skillName = 'Ambush',
  mult = 1.6,
): Character {
  return {
    id,
    name,
    rarity: 'Common',
    stats: { hp, physAtk, magAtk: 4, physDef, magDef: 4, critRate: 3, speed },
    skill: { name: skillName, multiplier: mult, cooldown: 3 },
  };
}

export const ENCOUNTERS: Stage[] = [
  {
    id: 'enc-grass-wolves',
    name: 'Grassland Wolves',
    goldReward: 80,
    enemyTeam: [
      foe('g-wolf-1', 'Prairie Wolf', 70, 16, 5, 14, 'Bite', 1.5),
      foe('g-wolf-2', 'Prairie Wolf', 70, 16, 5, 14, 'Bite', 1.5),
      foe('g-wolf-3', 'Alpha Wolf', 95, 20, 7, 12, 'Savage Bite', 1.8),
    ],
  },
  {
    id: 'enc-bandits',
    name: 'Highway Bandits',
    goldReward: 130,
    enemyTeam: [
      foe('bandit-scout', 'Bandit Scout', 90, 18, 8, 13, 'Cheap Shot', 1.6),
      foe('bandit-thug', 'Bandit Thug', 120, 22, 10, 9, 'Gut Punch', 1.7),
      foe('bandit-captain', 'Bandit Captain', 140, 26, 12, 11, 'Ruthless Strike', 2.0),
    ],
  },
  {
    id: 'enc-ruins-spirits',
    name: 'Restless Spirits',
    goldReward: 150,
    enemyTeam: [
      foe('spirit-1', 'Lost Spirit', 100, 14, 6, 15, 'Wail', 1.6),
      foe('spirit-2', 'Lost Spirit', 100, 14, 6, 15, 'Wail', 1.6),
      foe('wraith', 'Bound Wraith', 140, 22, 10, 12, 'Soul Rend', 1.9),
    ],
  },
  {
    id: 'enc-mercenaries',
    name: 'Road Sellswords',
    goldReward: 170,
    enemyTeam: [
      foe('merc-1', 'Sellsword', 150, 24, 14, 10, 'Blade Flurry', 1.9),
      foe('merc-2', 'Sellsword', 150, 24, 14, 10, 'Blade Flurry', 1.9),
      foe('merc-captain', 'Mercenary Captain', 180, 30, 16, 12, 'Execute', 2.2),
    ],
  },
  {
    id: 'town-bandits',
    name: 'Town Bandits',
    goldReward: 100,
    enemyTeam: [
      foe('town-thief', 'Street Thief', 80, 15, 6, 13, 'Pickpocket Slash', 1.4),
      foe('town-thug', 'Alley Thug', 110, 20, 9, 10, 'Sucker Punch', 1.6),
      foe('town-boss', 'Gang Leader', 130, 24, 11, 11, 'Dirty Strike', 1.8),
    ],
  },
];
