export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type BannerType = 'standard' | 'adventure';

export interface Skill {
  name: string;
  multiplier: number;
  cooldown: number;
}

export interface Stats {
  hp: number;
  atk: number;
  def: number;
  speed: number;
}

export interface Character {
  id: string;
  name: string;
  rarity: Rarity;
  stats: Stats;
  skill: Skill;
  image?: string;
}

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
