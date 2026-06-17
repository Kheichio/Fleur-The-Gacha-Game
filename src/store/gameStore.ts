import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BannerType, Character } from '../types';
import { STAGES } from '../data/stages';
import { ADVENTURE_PULL_COST, DUPLICATE_REFUND, STANDARD_PULL_COST, pullOne } from '../systems/gacha';

interface GameState {
  coins: number;
  rubies: number;
  ownedCounts: Record<string, number>;
  activeTeamIds: string[];
  unlockedStageIds: string[];
  lastPullResults: Character[];
  lastPullBanner: BannerType;
  pull: (count: number, banner: BannerType) => void;
  setTeam: (ids: string[]) => void;
  completeStage: (stageId: string, won: boolean, reward: number) => void;
  addCoins: (amount: number) => void;
  addRubies: (amount: number) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 1500,
      rubies: 10,
      ownedCounts: {},
      activeTeamIds: [],
      unlockedStageIds: [STAGES[0].id],
      lastPullResults: [],
      lastPullBanner: 'standard',

      pull: (count, banner) => {
        const state = get();

        if (banner === 'standard') {
          const cost = STANDARD_PULL_COST * count;
          if (state.coins < cost) return;
          const results: Character[] = [];
          let delta = -cost;
          const newCounts = { ...state.ownedCounts };
          for (let i = 0; i < count; i++) {
            const c = pullOne('standard');
            results.push(c);
            if (newCounts[c.id]) delta += DUPLICATE_REFUND;
            newCounts[c.id] = (newCounts[c.id] ?? 0) + 1;
          }
          set({ coins: state.coins + delta, ownedCounts: newCounts, lastPullResults: results, lastPullBanner: 'standard' });
        } else {
          const cost = ADVENTURE_PULL_COST * count;
          if (state.rubies < cost) return;
          const results: Character[] = [];
          let coinsDelta = 0;
          const newCounts = { ...state.ownedCounts };
          for (let i = 0; i < count; i++) {
            const c = pullOne('adventure');
            results.push(c);
            if (newCounts[c.id]) coinsDelta += DUPLICATE_REFUND;
            newCounts[c.id] = (newCounts[c.id] ?? 0) + 1;
          }
          set({ rubies: state.rubies - cost, coins: state.coins + coinsDelta, ownedCounts: newCounts, lastPullResults: results, lastPullBanner: 'adventure' });
        }
      },

      setTeam: (ids) => set({ activeTeamIds: ids.slice(0, 3) }),

      completeStage: (stageId, won, reward) => {
        if (!won) return;
        const state = get();
        const idx = STAGES.findIndex((s) => s.id === stageId);
        if (idx === -1) {
          // Travel encounter — just award coins, no stage unlock
          set({ coins: state.coins + reward });
          return;
        }
        const next = STAGES[idx + 1];
        const unlocked = new Set(state.unlockedStageIds);
        unlocked.add(stageId);
        if (next) unlocked.add(next.id);
        set({ coins: state.coins + reward, unlockedStageIds: Array.from(unlocked) });
      },

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
      addRubies: (amount) => set((s) => ({ rubies: s.rubies + amount })),
    }),
    { name: 'fleur-save-v2' }
  )
);
