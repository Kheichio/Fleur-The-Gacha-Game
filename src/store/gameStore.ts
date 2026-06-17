import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BannerType, Character, CharacterSaveData, EquipmentItem, PullResult } from '../types';
import { STAGES } from '../data/stages';
import { ADVENTURE_PULL_COST, BEYOND_PULL_COST, DEMON_PULL_COST, DUPLICATE_REFUND, PITY_THRESHOLD, STANDARD_PULL_COST, pullOne } from '../systems/gacha';
import { levelFromXp, TRAIN_COST, TRAIN_XP } from '../systems/leveling';
import { upgradeItem, UPGRADE_COSTS } from '../data/equipment';

export interface PlayerStats {
  totalPulls: number;
  coinsSpent: number;
  rubiesSpent: number;
  monstersDefeated: number;
  teammatesPerished: number;
  itemsObtained: number;
}

export interface PlayerProfile {
  name: string;
  pfp: string;
  favouriteCharId: string;
}

interface GameState {
  coins: number;
  rubies: number;
  ownedCounts: Record<string, number>;
  characterData: Record<string, CharacterSaveData>;
  activeTeamIds: string[];
  unlockedStageIds: string[];
  lastPullResults: PullResult[];
  lastPullBanner: BannerType;
  items: Record<string, number>;
  currentNodeId: string;
  inventory: EquipmentItem[];
  equipped: Record<string, { weapon?: string; armor?: string; accessory?: string }>;
  pityCounters: Record<BannerType, number>;
  playerStats: PlayerStats;
  profile: PlayerProfile;

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
  upgradeEquipment: (uid: string) => void;
  equipItem: (charId: string, itemUid: string) => void;
  unequipItem: (charId: string, slot: 'weapon' | 'armor' | 'accessory') => void;
  setProfile: (partial: Partial<PlayerProfile>) => void;
  recordDefeats: (monstersKilled: number, alliesLost: number) => void;
  wipeData: () => void;
}

const DEFAULT_PITY: Record<BannerType, number> = { standard: 0, adventure: 0, demon: 0, beyond: 0 };
const DEFAULT_STATS: PlayerStats = { totalPulls: 0, coinsSpent: 0, rubiesSpent: 0, monstersDefeated: 0, teammatesPerished: 0, itemsObtained: 0 };
const DEFAULT_PROFILE: PlayerProfile = { name: '', pfp: 'default', favouriteCharId: '' };

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
      inventory: [],
      equipped: {},
      pityCounters: { ...DEFAULT_PITY },
      playerStats: { ...DEFAULT_STATS },
      profile: { ...DEFAULT_PROFILE },

      pull: (count, banner) => {
        const state = get();
        const pity = { ...(state.pityCounters ?? DEFAULT_PITY) };
        const stats = { ...(state.playerStats ?? DEFAULT_STATS) };

        if (banner === 'standard') {
          const cost = STANDARD_PULL_COST * count;
          if (state.coins < cost) return;
          const results: PullResult[] = [];
          let coinsDelta = -cost;
          const newCounts = { ...state.ownedCounts };
          const newInventory = [...(state.inventory ?? [])];
          let currentPity = pity[banner] ?? 0;
          let itemsGot = 0;

          for (let i = 0; i < count; i++) {
            currentPity++;
            const forceLegendary = currentPity >= PITY_THRESHOLD;
            const result = pullOne('standard', forceLegendary);
            results.push(result);

            if (result.type === 'character') {
              const c = result.character;
              if (newCounts[c.id]) coinsDelta += DUPLICATE_REFUND;
              newCounts[c.id] = (newCounts[c.id] ?? 0) + 1;
              if (c.rarity === 'Legendary') currentPity = 0;
            } else {
              newInventory.push(result.item);
              itemsGot++;
              if (result.item.rarity === 'Legendary') currentPity = 0;
            }
          }
          pity[banner] = currentPity;
          stats.totalPulls += count;
          stats.coinsSpent += cost;
          stats.itemsObtained += itemsGot;
          set({ coins: state.coins + coinsDelta, ownedCounts: newCounts, inventory: newInventory, lastPullResults: results, lastPullBanner: 'standard', pityCounters: pity, playerStats: stats });
        } else {
          const rubyCost = banner === 'demon' ? DEMON_PULL_COST : banner === 'beyond' ? BEYOND_PULL_COST : ADVENTURE_PULL_COST;
          const cost = rubyCost * count;
          if (state.rubies < cost) return;
          const results: PullResult[] = [];
          let coinsDelta = 0;
          const newCounts = { ...state.ownedCounts };
          const newInventory = [...(state.inventory ?? [])];
          let currentPity = pity[banner] ?? 0;
          let itemsGot = 0;

          for (let i = 0; i < count; i++) {
            currentPity++;
            const forceLegendary = currentPity >= PITY_THRESHOLD;
            const result = pullOne(banner, forceLegendary);
            results.push(result);

            if (result.type === 'character') {
              const c = result.character;
              if (newCounts[c.id]) coinsDelta += DUPLICATE_REFUND;
              newCounts[c.id] = (newCounts[c.id] ?? 0) + 1;
              if (c.rarity === 'Legendary') currentPity = 0;
            } else {
              newInventory.push(result.item);
              itemsGot++;
              if (result.item.rarity === 'Legendary') currentPity = 0;
            }
          }
          pity[banner] = currentPity;
          stats.totalPulls += count;
          stats.rubiesSpent += cost;
          stats.itemsObtained += itemsGot;
          set({ rubies: state.rubies - cost, coins: state.coins + coinsDelta, ownedCounts: newCounts, inventory: newInventory, lastPullResults: results, lastPullBanner: banner, pityCounters: pity, playerStats: stats });
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

      upgradeEquipment: (uid) => {
        set((s) => {
          const inv = s.inventory ?? [];
          const idx = inv.findIndex((it) => it.uid === uid);
          if (idx === -1) return s;
          const item = inv[idx];
          if (item.level >= 5) return s;
          const cost = UPGRADE_COSTS[item.level];
          if (s.coins < cost) return s;
          const upgraded = upgradeItem(item);
          const newInv = [...inv];
          newInv[idx] = upgraded;
          return { coins: s.coins - cost, inventory: newInv };
        });
      },

      equipItem: (charId, itemUid) => {
        set((s) => {
          const inv = s.inventory ?? [];
          const item = inv.find((it) => it.uid === itemUid);
          if (!item) return s;
          const slot = item.slot;
          const eq = { ...(s.equipped ?? {}) };
          // Unequip from anyone else who has this item
          for (const [cid, slots] of Object.entries(eq)) {
            if (slots[slot] === itemUid) {
              eq[cid] = { ...slots, [slot]: undefined };
            }
          }
          const charSlots = eq[charId] ?? {};
          eq[charId] = { ...charSlots, [slot]: itemUid };
          return { equipped: eq };
        });
      },

      unequipItem: (charId, slot) => {
        set((s) => {
          const eq = { ...(s.equipped ?? {}) };
          const charSlots = eq[charId] ?? {};
          eq[charId] = { ...charSlots, [slot]: undefined };
          return { equipped: eq };
        });
      },

      setProfile: (partial) => set((s) => ({ profile: { ...(s.profile ?? DEFAULT_PROFILE), ...partial } })),

      recordDefeats: (monstersKilled, alliesLost) => {
        set((s) => {
          const stats = { ...(s.playerStats ?? DEFAULT_STATS) };
          stats.monstersDefeated += monstersKilled;
          stats.teammatesPerished += alliesLost;
          return { playerStats: stats };
        });
      },

      wipeData: () => {
        set({
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
          inventory: [],
          equipped: {},
          pityCounters: { ...DEFAULT_PITY },
          playerStats: { ...DEFAULT_STATS },
          profile: { ...DEFAULT_PROFILE },
        });
      },
    }),
    { name: 'fleur-save-v3' }
  )
);
