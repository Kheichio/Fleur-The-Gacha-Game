import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BannerType, Character, CharacterSaveData } from '../types';
import { STAGES } from '../data/stages';
import { ADVENTURE_PULL_COST, DUPLICATE_REFUND, STANDARD_PULL_COST, pullOne } from '../systems/gacha';
import { levelFromXp, TRAIN_COST, TRAIN_XP } from '../systems/leveling';

interface GameState {
  coins: number;
  rubies: number;
  ownedCounts: Record<string, number>;
  characterData: Record<string, CharacterSaveData>;
  activeTeamIds: string[];
  unlockedStageIds: string[];
  lastPullResults: Character[];
  lastPullBanner: BannerType;
  items: Record<string, number>;
  currentNodeId: string;

  pull: (count: number, banner: BannerType) => void;
  setTeam: (ids: string[]) => void;
  completeStage: (stageId: string, won: boolean, reward: number) => void;
  addCoins: (amount: number) => void;
  addRubies: (amount: number) => void;
  gainXp: (ids: string[], amount: number) => void;
  buyXp: (id: string) => void;
  enhance: (id: string) => void;
  spendItem: (itemId: string) => void;
  moveToNode: (nodeId: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 1500,
      rubies: 10,
      ownedCounts: {},
      characterData: {},
      activeTeamIds: [],
      unlockedStageIds: [STAGES[0].id],
      lastPullResults: [],
      lastPullBanner: 'standard',
      items: { 'healing-herb': 3 },
      currentNodeId: 'mossgate',

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

      gainXp: (ids, amount) => {
        set((s) => {
          const newData = { ...s.characterData };
          for (const id of ids) {
            const d = newData[id] ?? { level: 1, xp: 0, enhancement: 0 };
            const newXp = d.xp + amount;
            newData[id] = { ...d, xp: newXp, level: levelFromXp(newXp) };
          }
          return { characterData: newData };
        });
      },

      buyXp: (id) => {
        set((s) => {
          if (s.coins < TRAIN_COST) return s;
          const d = s.characterData[id] ?? { level: 1, xp: 0, enhancement: 0 };
          const newXp = d.xp + TRAIN_XP;
          return {
            coins: s.coins - TRAIN_COST,
            characterData: { ...s.characterData, [id]: { ...d, xp: newXp, level: levelFromXp(newXp) } },
          };
        });
      },

      enhance: (id) => {
        set((s) => {
          const count = s.ownedCounts[id] ?? 0;
          const d = s.characterData[id] ?? { level: 1, xp: 0, enhancement: 0 };
          if (count < 2 || d.enhancement >= 5) return s;
          return {
            ownedCounts: { ...s.ownedCounts, [id]: count - 1 },
            characterData: { ...s.characterData, [id]: { ...d, enhancement: d.enhancement + 1 } },
          };
        });
      },

      spendItem: (itemId) => {
        set((s) => ({
          items: { ...s.items, [itemId]: Math.max(0, (s.items[itemId] ?? 0) - 1) },
        }));
      },

      moveToNode: (nodeId) => set({ currentNodeId: nodeId }),
    }),
    { name: 'fleur-save-v3' }
  )
);
