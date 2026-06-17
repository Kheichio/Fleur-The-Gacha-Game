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
    id: 'enc-wolves',
    name: 'Wolf Pack',
    goldReward: 80,
    enemyTeam: [
      foe('wolf-1', 'Forest Wolf', 70, 16, 5, 14, 'Bite', 1.5),
      foe('wolf-2', 'Forest Wolf', 70, 16, 5, 14, 'Bite', 1.5),
      foe('wolf-3', 'Dire Wolf', 95, 20, 7, 12, 'Savage Bite', 1.8),
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
    id: 'enc-mercenaries',
    name: 'Sellswords',
    goldReward: 170,
    enemyTeam: [
      foe('merc-1', 'Sellsword', 150, 24, 14, 10, 'Blade Flurry', 1.9),
      foe('merc-2', 'Sellsword', 150, 24, 14, 10, 'Blade Flurry', 1.9),
      foe('merc-captain', 'Mercenary Captain', 180, 30, 16, 12, 'Execute', 2.2),
    ],
  },
];
