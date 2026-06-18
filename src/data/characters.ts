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
    stats: { hp: 120, physAtk: 20, magAtk: 5, physDef: 12, magDef: 8, critRate: 5, speed: 9 },
    skill: { name: 'Thorn Slash', multiplier: 1.5, cooldown: 2, type: 'melee' },
    image: '/images/characters/rose-knight.png',
    description: 'A steadfast knight who guards the flower gardens with thorned resolve. Reliable, stubborn, and proud of their post.',
  },
  {
    id: 'daisy-squire',
    name: 'Daisy Squire',
    rarity: 'Common',
    stats: { hp: 130, physAtk: 16, magAtk: 4, physDef: 15, magDef: 10, critRate: 3, speed: 8 },
    skill: { name: 'Guard Bash', multiplier: 1.4, cooldown: 2, type: 'melee' },
    description: 'Young and eager, the Daisy Squire aspires to knighthood above all else. Their shield is battered but their spirit holds.',
  },
  {
    id: 'clover-scout',
    name: 'Clover Scout',
    rarity: 'Common',
    stats: { hp: 100, physAtk: 22, magAtk: 4, physDef: 8, magDef: 6, critRate: 12, speed: 12 },
    skill: { name: 'Quickstrike', multiplier: 1.5, cooldown: 2, type: 'melee' },
    description: 'Quick-footed and sharp-eyed, the Clover Scout slips through any terrain unseen — and strikes before you notice them.',
  },
  // Rare
  {
    id: 'iris-archer',
    name: 'Iris Archer',
    rarity: 'Rare',
    stats: { hp: 110, physAtk: 26, magAtk: 6, physDef: 10, magDef: 8, critRate: 15, speed: 13 },
    skill: { name: 'Piercing Shot', multiplier: 1.8, cooldown: 3, type: 'melee' },
    description: 'A marksman whose arrows never miss their mark, drawn from the misty iris fields at the edge of the realm.',
  },
  {
    id: 'lily-mage',
    name: 'Lily Mage',
    rarity: 'Rare',
    stats: { hp: 95, physAtk: 6, magAtk: 32, physDef: 6, magDef: 12, critRate: 8, speed: 10 },
    skill: { name: 'Petal Storm', multiplier: 2.0, cooldown: 3, type: 'magic' },
    description: 'A gentle scholar who conjures storms of enchanted petals. Her magic looks beautiful and hits with devastating force.',
  },
  {
    id: 'thorn-berserker',
    name: 'Thorn Berserker',
    rarity: 'Rare',
    stats: { hp: 140, physAtk: 28, magAtk: 5, physDef: 14, magDef: 8, critRate: 8, speed: 7 },
    skill: { name: 'Bramble Fury', multiplier: 1.9, cooldown: 3, type: 'melee' },
    description: 'Rage given physical form. The Thorn Berserker tears through enemies like a living storm of thorns and fury.',
  },
  {
    id: 'casilda',
    name: 'Casilda',
    rarity: 'Rare',
    stats: { hp: 135, physAtk: 22, magAtk: 5, physDef: 16, magDef: 10, critRate: 6, speed: 9 },
    skill: { name: 'Righteous Sweep', multiplier: 1.7, cooldown: 2, type: 'melee' },
    image: '/images/characters/casilda.png',
    description: 'A third-generation Solitaria migrant who lost everything — her parents, her land, her hope. Rescued from the streets by a three-year-old Róza, she became the girl\'s maid and closest companion. No magic, no divine blood — only a broom and unbreakable heart.',
  },
  {
    id: 'auxentios-brigach',
    name: 'Auxentios Brígach',
    rarity: 'Epic',
    stats: { hp: 140, physAtk: 28, magAtk: 6, physDef: 18, magDef: 12, critRate: 8, speed: 11 },
    skill: { name: "Brígach's Strike", multiplier: 2.0, cooldown: 3, type: 'melee' },
    image: '/images/characters/auxentios.png',
    description: 'A guard of Tesialyrodi and wielder of the Sword of Demon Remains, a family relic forged 150 years ago by his great-great-grandfather at the end of the Great War. Of mixed Féinlárnach and Psevdìan blood, his family fled south during the war. His blade is deliberate, his honour absolute.',
  },
  // Epic
  {
    id: 'orchid-duelist',
    name: 'Orchid Duelist',
    rarity: 'Epic',
    stats: { hp: 130, physAtk: 36, magAtk: 10, physDef: 16, magDef: 12, critRate: 18, speed: 14 },
    skill: { name: 'Bloodbloom Strike', multiplier: 2.3, cooldown: 3, type: 'melee' },
    description: 'Elegant and lethal, the Orchid Duelist turns every battle into a dance. Their blade flows like water and cuts like wind.',
  },
  {
    id: 'wisteria-priestess',
    name: 'Wisteria Priestess',
    rarity: 'Epic',
    stats: { hp: 150, physAtk: 10, magAtk: 34, physDef: 18, magDef: 20, critRate: 8, speed: 9 },
    skill: { name: 'Wisteria Smite', multiplier: 2.2, cooldown: 3, type: 'magic' },
    description: 'A healer-warrior who channels the ancient power of the wisteria grove into devastating holy strikes.',
  },
  {
    id: 'tomoe-yoshimi',
    name: 'Tomoe Yoshimi',
    rarity: 'Legendary',
    stats: { hp: 115, physAtk: 38, magAtk: 8, physDef: 10, magDef: 8, critRate: 22, speed: 19 },
    skill: { name: 'Demon Gale Strike', multiplier: 2.5, cooldown: 3, type: 'melee' },
    image: '/images/characters/tomoe-yoshimi.png',
    description: 'High General of the Demon Kingdom during the War Era, titled "The Strongest Demon General" by the Demon Lord himself. She mastered an ancient combat technique in weeks that takes others years. A demon of fierce honour who left the Kingdom when its leaders began to forget the old ways.',
  },
  {
    id: 'roza-defteros',
    name: 'Róza Défteros',
    rarity: 'Legendary',
    stats: { hp: 105, physAtk: 10, magAtk: 40, physDef: 8, magDef: 14, critRate: 16, speed: 16 },
    skill: { name: 'Lustra Borealis', multiplier: 2.7, cooldown: 3, type: 'magic' },
    image: '/images/characters/roza.png',
    description: 'Daughter of the Lord of Tesialyrodi, raised by the clergy and her maid Casilda. At six she began seeing visions of a prophecy — a tall woman with a golden eye cover and floating crown. When the sisters denied any knowledge of it, Róza set out on a pilgrimage to find the deity herself. Inventor of Lustra Borealis.',
  },
  // Legendary
  {
    id: 'fleur-theos',
    name: 'Fleur Theòs',
    rarity: 'Legendary',
    stats: { hp: 185, physAtk: 15, magAtk: 48, physDef: 12, magDef: 28, critRate: 12, speed: 13 },
    skill: { name: "Theós's Radiance", multiplier: 3.0, cooldown: 4, type: 'magic' },
    image: '/images/characters/fleur-theos.png',
    description: 'A Pure Elf Mage who ended the Great War by creating No Man\'s Land — a scar of devastating magic between the Demon Kingdom and the Royal Kingdom. In her true form she stands three metres tall and the world trembles. In her mortal guise she walks gently — but never unaware.',
  },
  {
    id: 'anwaltin-von-berater',
    name: 'Anwältin Von Berater',
    rarity: 'Legendary',
    stats: { hp: 175, physAtk: 12, magAtk: 52, physDef: 14, magDef: 30, critRate: 15, speed: 16 },
    skill: { name: 'Event Horizon', multiplier: 3.2, cooldown: 4, type: 'magic' },
    image: '/images/characters/anwaltin.png',
    description: 'A woman of modern society who wields incomprehensible power. Kind and sweet on the surface, but cross her and she will collapse reality itself. Her black holes devour all, and her mind control bends the strongest wills.',
  },
];
