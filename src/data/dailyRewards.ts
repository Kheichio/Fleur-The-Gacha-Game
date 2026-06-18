export interface DailyReward {
  day: number;
  type: 'coins' | 'rubies' | 'item' | 'ticket';
  amount: number;
  label: string;
  icon: string;
  special?: boolean;
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1,  type: 'coins',  amount: 500,  label: '500 Coins',    icon: '🪙' },
  { day: 2,  type: 'rubies', amount: 1,    label: '1 Ruby',       icon: '💎' },
  { day: 3,  type: 'coins',  amount: 800,  label: '800 Coins',    icon: '🪙' },
  { day: 4,  type: 'item',   amount: 1,    label: 'Healing Herb',  icon: '🌿' },
  { day: 5,  type: 'rubies', amount: 2,    label: '2 Rubies',     icon: '💎' },
  { day: 6,  type: 'coins',  amount: 1200, label: '1,200 Coins',  icon: '🪙' },
  { day: 7,  type: 'ticket', amount: 1,    label: 'Banner Ticket', icon: '🎫', special: true },
  { day: 8,  type: 'coins',  amount: 600,  label: '600 Coins',    icon: '🪙' },
  { day: 9,  type: 'rubies', amount: 1,    label: '1 Ruby',       icon: '💎' },
  { day: 10, type: 'item',   amount: 1,    label: 'Strong Tonic',  icon: '🧪' },
  { day: 11, type: 'coins',  amount: 1000, label: '1,000 Coins',  icon: '🪙' },
  { day: 12, type: 'rubies', amount: 2,    label: '2 Rubies',     icon: '💎' },
  { day: 13, type: 'coins',  amount: 1500, label: '1,500 Coins',  icon: '🪙' },
  { day: 14, type: 'ticket', amount: 1,    label: 'Banner Ticket', icon: '🎫', special: true },
  { day: 15, type: 'rubies', amount: 3,    label: '3 Rubies',     icon: '💎' },
  { day: 16, type: 'coins',  amount: 800,  label: '800 Coins',    icon: '🪙' },
  { day: 17, type: 'item',   amount: 2,    label: '2x Healing Herb', icon: '🌿' },
  { day: 18, type: 'rubies', amount: 2,    label: '2 Rubies',     icon: '💎' },
  { day: 19, type: 'coins',  amount: 2000, label: '2,000 Coins',  icon: '🪙' },
  { day: 20, type: 'rubies', amount: 3,    label: '3 Rubies',     icon: '💎' },
  { day: 21, type: 'coins',  amount: 1500, label: '1,500 Coins',  icon: '🪙' },
  { day: 22, type: 'item',   amount: 2,    label: '2x Strong Tonic', icon: '🧪' },
  { day: 23, type: 'rubies', amount: 2,    label: '2 Rubies',     icon: '💎' },
  { day: 24, type: 'coins',  amount: 2500, label: '2,500 Coins',  icon: '🪙' },
  { day: 25, type: 'rubies', amount: 3,    label: '3 Rubies',     icon: '💎' },
  { day: 26, type: 'coins',  amount: 2000, label: '2,000 Coins',  icon: '🪙' },
  { day: 27, type: 'rubies', amount: 4,    label: '4 Rubies',     icon: '💎' },
  { day: 28, type: 'coins',  amount: 3000, label: '3,000 Coins',  icon: '🪙' },
  { day: 29, type: 'rubies', amount: 5,    label: '5 Rubies',     icon: '💎' },
  { day: 30, type: 'ticket', amount: 3,    label: '3x Banner Tickets', icon: '🎫', special: true },
];
