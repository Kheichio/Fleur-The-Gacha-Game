export interface Quest {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  check: (stats: QuestCheckData) => boolean;
}

export interface QuestCheckData {
  totalPulls: number;
  monstersDefeated: number;
  charactersOwned: number;
  itemsOwned: number;
  stagesCleared: number;
  totalLevel: number;
  enhancedAny: boolean;
  equippedAny: boolean;
}

export const QUESTS: Quest[] = [
  {
    id: 'first-pull',
    name: 'First Summon',
    description: 'Perform your first pull from any banner.',
    icon: '📜',
    reward: 3,
    check: (d) => d.totalPulls >= 1,
  },
  {
    id: 'pull-10',
    name: 'Eager Summoner',
    description: 'Perform 10 total pulls.',
    icon: '🎲',
    reward: 5,
    check: (d) => d.totalPulls >= 10,
  },
  {
    id: 'pull-50',
    name: 'Devoted Summoner',
    description: 'Perform 50 total pulls.',
    icon: '🎰',
    reward: 10,
    check: (d) => d.totalPulls >= 50,
  },
  {
    id: 'pull-100',
    name: 'Obsessed Summoner',
    description: 'Perform 100 total pulls.',
    icon: '💫',
    reward: 25,
    check: (d) => d.totalPulls >= 100,
  },
  {
    id: 'slay-1',
    name: 'First Blood',
    description: 'Defeat your first monster in battle.',
    icon: '⚔️',
    reward: 2,
    check: (d) => d.monstersDefeated >= 1,
  },
  {
    id: 'slay-10',
    name: 'Monster Hunter',
    description: 'Defeat 10 monsters.',
    icon: '💀',
    reward: 5,
    check: (d) => d.monstersDefeated >= 10,
  },
  {
    id: 'slay-50',
    name: 'Slayer',
    description: 'Defeat 50 monsters.',
    icon: '🗡️',
    reward: 15,
    check: (d) => d.monstersDefeated >= 50,
  },
  {
    id: 'own-3',
    name: 'Small Roster',
    description: 'Own at least 3 different characters.',
    icon: '👥',
    reward: 3,
    check: (d) => d.charactersOwned >= 3,
  },
  {
    id: 'own-8',
    name: 'Growing Army',
    description: 'Own at least 8 different characters.',
    icon: '🛡️',
    reward: 10,
    check: (d) => d.charactersOwned >= 8,
  },
  {
    id: 'clear-1',
    name: 'First Victory',
    description: 'Clear your first stage.',
    icon: '🏆',
    reward: 3,
    check: (d) => d.stagesCleared >= 1,
  },
  {
    id: 'clear-3',
    name: 'Adventurer',
    description: 'Clear 3 stages.',
    icon: '🗺️',
    reward: 8,
    check: (d) => d.stagesCleared >= 3,
  },
  {
    id: 'level-up',
    name: 'Trainer',
    description: 'Reach a combined team level of 10.',
    icon: '📈',
    reward: 5,
    check: (d) => d.totalLevel >= 10,
  },
  {
    id: 'enhance-1',
    name: 'Star Power',
    description: 'Enhance any character at least once.',
    icon: '⭐',
    reward: 5,
    check: (d) => d.enhancedAny,
  },
  {
    id: 'equip-1',
    name: 'Geared Up',
    description: 'Equip an item to any character.',
    icon: '🔧',
    reward: 3,
    check: (d) => d.equippedAny,
  },
  {
    id: 'items-5',
    name: 'Collector',
    description: 'Have 5 equipment items in your luggage.',
    icon: '🧳',
    reward: 5,
    check: (d) => d.itemsOwned >= 5,
  },
  {
    id: 'items-20',
    name: 'Hoarder',
    description: 'Have 20 equipment items in your luggage.',
    icon: '📦',
    reward: 15,
    check: (d) => d.itemsOwned >= 20,
  },
];
