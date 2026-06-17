export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type BannerType = 'standard' | 'adventure' | 'demon' | 'beyond' | 'archive';
export type StatKey = 'hp' | 'physAtk' | 'magAtk' | 'physDef' | 'magDef' | 'critRate' | 'speed';

export interface Skill {
  name: string;
  multiplier: number;
  cooldown: number;
  type?: 'melee' | 'magic';
}

export interface Stats {
  hp: number;
  physAtk: number;
  magAtk: number;
  physDef: number;
  magDef: number;
  critRate: number;
  speed: number;
}

export interface Character {
  id: string;
  name: string;
  rarity: Rarity;
  stats: Stats;
  skill: Skill;
  image?: string;
  description?: string;
}

export interface CharacterSaveData {
  level: number;
  xp: number;
  enhancement: number;
}

export interface EquipmentItem {
  uid: string;
  name: string;
  rarity: Rarity;
  slot: 'weapon' | 'armor' | 'accessory';
  mainStat: { stat: StatKey; value: number };
  subStats: { stat: StatKey; value: number }[];
  level: number;
  locked?: boolean;
}

export type PullResult =
  | { type: 'character'; character: Character }
  | { type: 'item'; item: EquipmentItem };

export interface Stage {
  id: string;
  name: string;
  enemyTeam: Character[];
  goldReward: number;
}

export interface BattleUnit {
  uid: string;
  character: Character;
  currentHp: number;
  maxHp: number;
  skillCooldownRemaining: number;
  isPlayer: boolean;
  alive: boolean;
}
