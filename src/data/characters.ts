import type { Character, Rarity } from '../types';

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  Common: 60,
  Rare: 30,
  Epic: 8,
  Legendary: 2,
};

export const RARITY_COLORS: Record<Rarity, string> = {
  Common: 'border-gray-400 text-gray-200',
  Rare: 'border-blue-400 text-blue-200',
  Epic: 'border-purple-400 text-purple-200',
  Legendary: 'border-yellow-400 text-yellow-200',
};

export const CHARACTER_POOL: Character[] = [
  // Common
  {
    id: 'rose-knight',
    name: 'Rose Knight',
    rarity: 'Common',
    stats: { hp: 120, atk: 18, def: 10, speed: 9 },
    skill: { name: 'Thorn Slash', multiplier: 1.5, cooldown: 2, type: 'melee' },
    description: 'A steadfast knight who guards the flower gardens with thorned resolve. Reliable, stubborn, and proud of their post.',
  },
  {
    id: 'daisy-squire',
    name: 'Daisy Squire',
    rarity: 'Common',
    stats: { hp: 130, atk: 15, def: 12, speed: 8 },
    skill: { name: 'Guard Bash', multiplier: 1.4, cooldown: 2, type: 'melee' },
    description: 'Young and eager, the Daisy Squire aspires to knighthood above all else. Their shield is battered but their spirit holds.',
  },
  {
    id: 'clover-scout',
    name: 'Clover Scout',
    rarity: 'Common',
    stats: { hp: 100, atk: 20, def: 7, speed: 12 },
    skill: { name: 'Quickstrike', multiplier: 1.5, cooldown: 2, type: 'melee' },
    description: 'Quick-footed and sharp-eyed, the Clover Scout slips through any terrain unseen — and strikes before you notice them.',
  },
  // Rare
  {
    id: 'iris-archer',
    name: 'Iris Archer',
    rarity: 'Rare',
    stats: { hp: 110, atk: 24, def: 9, speed: 13 },
    skill: { name: 'Piercing Shot', multiplier: 1.8, cooldown: 3, type: 'melee' },
    description: 'A marksman whose arrows never miss their mark, drawn from the misty iris fields at the edge of the realm.',
  },
  {
    id: 'lily-mage',
    name: 'Lily Mage',
    rarity: 'Rare',
    stats: { hp: 95, atk: 28, def: 6, speed: 10 },
    skill: { name: 'Petal Storm', multiplier: 2.0, cooldown: 3, type: 'magic' },
    description: 'A gentle scholar who conjures storms of enchanted petals. Her magic looks beautiful and hits with devastating force.',
  },
  {
    id: 'thorn-berserker',
    name: 'Thorn Berserker',
    rarity: 'Rare',
    stats: { hp: 140, atk: 26, def: 11, speed: 7 },
    skill: { name: 'Bramble Fury', multiplier: 1.9, cooldown: 3, type: 'melee' },
    description: 'Rage given physical form. The Thorn Berserker tears through enemies like a living storm of thorns and fury.',
  },
  // Epic
  {
    id: 'orchid-duelist',
    name: 'Orchid Duelist',
    rarity: 'Epic',
    stats: { hp: 130, atk: 34, def: 14, speed: 14 },
    skill: { name: 'Bloodbloom Strike', multiplier: 2.3, cooldown: 3, type: 'melee' },
    description: 'Elegant and lethal, the Orchid Duelist turns every battle into a dance. Their blade flows like water and cuts like wind.',
  },
  {
    id: 'wisteria-priestess',
    name: 'Wisteria Priestess',
    rarity: 'Epic',
    stats: { hp: 150, atk: 30, def: 16, speed: 9 },
    skill: { name: 'Wisteria Smite', multiplier: 2.2, cooldown: 3, type: 'magic' },
    description: 'A healer-warrior who channels the ancient power of the wisteria grove into devastating holy strikes.',
  },
  // Novel characters
  {
    id: 'fleur-theos',
    name: 'Fleur Theòs',
    rarity: 'Legendary',
    stats: { hp: 185, atk: 44, def: 20, speed: 13 },
    skill: { name: "Theós's Radiance", multiplier: 3.0, cooldown: 4, type: 'magic' },
    image: '/images/characters/fleur-theos.png',
    description: 'A Pure Elf Demi-God of immeasurable grace. In her true form she stands three metres tall and the world trembles. In her mortal guise she walks gently — but never unaware.',
  },
  {
    id: 'tomoe-yoshimi',
    name: '巴吉見 Tomoe Yoshimi',
    rarity: 'Epic',
    stats: { hp: 115, atk: 35, def: 9, speed: 19 },
    skill: { name: 'Demon Gale Strike', multiplier: 2.5, cooldown: 3, type: 'melee' },
    image: '/images/characters/tomoe-yoshimi.png',
    description: 'A Humanoid Demon of fierce honour. Her katana moves faster than the eye can follow, shielded by demonic barriers and driven by an unshakeable moral code.',
  },
  {
    id: 'casilda',
    name: 'Casilda',
    rarity: 'Rare',
    stats: { hp: 135, atk: 21, def: 13, speed: 9 },
    skill: { name: 'Righteous Sweep', multiplier: 1.7, cooldown: 2, type: 'melee' },
    image: '/images/characters/casilda.png',
    description: 'An ordinary woman from Solitaria who faces the extraordinary with her broom and an unbroken spirit. No power — only heart.',
  },
  {
    id: 'auxentios-brigach',
    name: 'Auxentios Brígach',
    rarity: 'Rare',
    stats: { hp: 140, atk: 26, def: 14, speed: 11 },
    skill: { name: "Brígach's Strike", multiplier: 2.0, cooldown: 3, type: 'melee' },
    image: '/images/characters/auxentios.png',
    description: 'A kind-hearted swordsman of mixed Féinlárnach and Psevdìan blood. His blade is deliberate, his honour absolute, and his caution often the difference between life and death.',
  },
  {
    id: 'roza-defteros',
    name: 'Róza Défteros',
    rarity: 'Epic',
    stats: { hp: 105, atk: 36, def: 7, speed: 16 },
    skill: { name: 'Lustra Borealis', multiplier: 2.7, cooldown: 3, type: 'magic' },
    image: '/images/characters/roza.png',
    description: 'A Psevdìan mage who invented Lustra Borealis — a field of light compressed to near-infinite density, travelling at the speed of itself. Curious, sincere, and quietly brilliant.',
  },
  // Legendary
  {
    id: 'fleur-sovereign',
    name: 'Fleur Sovereign',
    rarity: 'Legendary',
    stats: { hp: 170, atk: 40, def: 18, speed: 15 },
    skill: { name: 'Eternal Bloom', multiplier: 2.8, cooldown: 4, type: 'magic' },
    description: 'The supreme guardian of the Fleur realm. Eternal, unknowable, and inevitable. They say those who face her bloom once, then never again.',
  },
];
