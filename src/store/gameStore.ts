import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character } from '../types';
import { STAGES } from '../data/stages';
import { DUPLICATE_REFUND, PULL_COST, pullOne } from '../systems/gacha';

const STARTING_GEMS = 1000;

interface GameState {
  gems: number;
  ownedCounts: Record<string, number>;
  activeTeamIds: string[];
  unlockedStageIds: string[];
  lastPullResults: Character[];
  pull: (count: number) => void;
  setTeam: (ids: string[]) => void;
  completeStage: (stageId: string, won: boolean, reward: number) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      gems: STARTING_GEMS,
      ownedCounts: {},
      activeTeamIds: [],
      unlockedStageIds: [STAGES[0].id],
      lastPullResults: [],

      pull: (count) => {
        const state = get();
        const totalCost = PULL_COST * count;
        if (state.gems < totalCost) return;

        const results: Character[] = [];
        let gemsDelta = -totalCost;
        const newCounts = { ...state.ownedCounts };

        for (let i = 0; i < count; i++) {
          const character = pullOne();
          results.push(character);
          if (newCounts[character.id]) {
            gemsDelta += DUPLICATE_REFUND;
          }
          newCounts[character.id] = (newCounts[character.id] ?? 0) + 1;
        }

        set({
          gems: state.gems + gemsDelta,
          ownedCounts: newCounts,
          lastPullResults: results,
        });
      },

      setTeam: (ids) => set({ activeTeamIds: ids.slice(0, 3) }),

      completeStage: (stageId, won, reward) => {
        if (!won) return;
        const state = get();
        const idx = STAGES.findIndex((s) => s.id === stageId);
        const next = STAGES[idx + 1];
        const unlocked = new Set(state.unlockedStageIds);
        unlocked.add(stageId);
        if (next) unlocked.add(next.id);
        set({ gems: state.gems + reward, unlockedStageIds: Array.from(unlocked) });
      },
    }),
    { name: 'fleur-game-save' }
  )
);
