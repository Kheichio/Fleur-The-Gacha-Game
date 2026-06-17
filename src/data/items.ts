export interface ItemDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  type: 'heal';
  value: number;
}

export const ITEM_DEFS: Record<string, ItemDef> = {
  'healing-herb': {
    id: 'healing-herb',
    name: 'Healing Herb',
    emoji: '🌿',
    desc: 'Restores 80 HP to one ally.',
    type: 'heal',
    value: 80,
  },
  'strong-tonic': {
    id: 'strong-tonic',
    name: 'Strong Tonic',
    emoji: '🧪',
    desc: 'Restores 200 HP to one ally.',
    type: 'heal',
    value: 200,
  },
};
