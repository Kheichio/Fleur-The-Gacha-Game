import type { EquipmentItem, Rarity, StatKey } from '../types';

const WEAPON_NAMES: Record<Rarity, string[]> = {
  Common:    ['Rusty Sword', 'Wooden Staff', 'Bent Dagger'],
  Rare:      ['Iron Blade', 'Oak Staff', 'Steel Dagger'],
  Epic:      ['Mithril Edge', 'Crystal Staff', 'Shadow Blade'],
  Legendary: ['Astral Blade', 'Void Staff', 'Eclipse Fang'],
};

const ARMOR_NAMES: Record<Rarity, string[]> = {
  Common:    ['Leather Vest', 'Cloth Robe', 'Hide Tunic'],
  Rare:      ['Chain Mail', 'Silk Robe', 'Studded Armor'],
  Epic:      ['Plate Armor', 'Arcane Robe', 'Dragon Hide'],
  Legendary: ['Divine Plate', 'Astral Mantle', 'Celestial Armor'],
};

const ACCESSORY_NAMES: Record<Rarity, string[]> = {
  Common:    ['Bronze Ring', 'Leather Charm', 'Wooden Bead'],
  Rare:      ['Silver Pendant', 'Jade Amulet', 'Iron Band'],
  Epic:      ['Ruby Necklace', 'Enchanted Brooch', 'Sapphire Ring'],
  Legendary: ['Crown of Stars', 'Heart of Eternity', 'Soul Signet'],
};

const SLOT_NAMES: Record<string, Record<Rarity, string[]>> = {
  weapon: WEAPON_NAMES,
  armor: ARMOR_NAMES,
  accessory: ACCESSORY_NAMES,
};

const WEAPON_STATS: StatKey[] = ['physAtk', 'magAtk', 'critRate', 'speed'];
const ARMOR_STATS: StatKey[]  = ['hp', 'physDef', 'magDef'];
const ANY_STATS: StatKey[]    = ['hp', 'physAtk', 'magAtk', 'physDef', 'magDef', 'critRate', 'speed'];

const SLOT_MAIN_STATS: Record<string, StatKey[]> = {
  weapon: WEAPON_STATS,
  armor: ARMOR_STATS,
  accessory: ANY_STATS,
};

const MAIN_STAT_RANGE: Record<Rarity, [number, number]> = {
  Common:    [5, 10],
  Rare:      [10, 18],
  Epic:      [18, 28],
  Legendary: [28, 40],
};

const SUB_STAT_RANGE: Record<Rarity, [number, number]> = {
  Common:    [2, 4],
  Rare:      [4, 8],
  Epic:      [8, 14],
  Legendary: [14, 22],
};

export const UPGRADE_COSTS = [500, 1000, 2000, 4000, 8000];

export const SLOT_EMOJI: Record<string, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
};

export const STAT_LABELS: Record<StatKey, string> = {
  hp: 'HP',
  physAtk: 'P.ATK',
  magAtk: 'M.ATK',
  physDef: 'P.DEF',
  magDef: 'M.DEF',
  critRate: 'CRIT',
  speed: 'SPD',
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function generateRandomItem(rarity: Rarity): EquipmentItem {
  const slot = pick(['weapon', 'armor', 'accessory']) as 'weapon' | 'armor' | 'accessory';
  const name = pick(SLOT_NAMES[slot][rarity]);
  const mainStatKey = pick(SLOT_MAIN_STATS[slot]);
  const [min, max] = MAIN_STAT_RANGE[rarity];

  return {
    uid: uid(),
    name,
    rarity,
    slot,
    mainStat: { stat: mainStatKey, value: randInt(min, max) },
    subStats: [],
    level: 0,
  };
}

export function upgradeItem(item: EquipmentItem): EquipmentItem {
  if (item.level >= 5) return item;

  const newLevel = item.level + 1;
  const boostedMain = { ...item.mainStat, value: Math.round(item.mainStat.value * 1.2) };
  const boostedSubs = item.subStats.map((s) => ({ ...s, value: Math.round(s.value * 1.15) }));

  const newStatKey = pick(ANY_STATS);
  const [subMin, subMax] = SUB_STAT_RANGE[item.rarity];

  boostedSubs.push({ stat: newStatKey, value: randInt(subMin, subMax) });

  return { ...item, level: newLevel, mainStat: boostedMain, subStats: boostedSubs };
}
