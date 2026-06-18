import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BannerType, Character, CharacterSaveData, EquipmentItem, PullResult } from '../types';
import { STAGES } from '../data/stages';
import { ADVENTURE_PULL_COST, ARCHIVE_PULL_COST, BEYOND_PULL_COST, DEMON_PULL_COST, DUPLICATE_REFUND, PITY_THRESHOLD, STANDARD_PULL_COST, pullOne } from '../systems/gacha';
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

const SHARD_VALUES: Record<string, number> = { Common: 5, Rare: 15, Epic: 50, Legendary: 200 };
const MAX_USEFUL_COPIES = 6;

interface GameState {
  coins: number;
  rubies: number;
  shards: number;
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
  claimedQuests: string[];
  currentHp: Record<string, number>;

  pull: (count: number, banner: BannerType) => void;
  setTeam: (ids: string[]) => void;
  completeStage: (stageId: string, won: boolean, reward: number) => void;
  addCoins: (amount: number) => void;
  addRubies: (amount: number) => void;
  gainXp: (ids: string[], amount: number) => void;
  buyXp: (id: string, times?: number) => void;
  enhance: (id: string) => void;
  spendItem: (itemId: string) => void;
  moveToNode: (nodeId: string) => void;
  upgradeEquipment: (uid: string) => void;
  equipItem: (charId: string, itemUid: string) => void;
  unequipItem: (charId: string, slot: 'weapon' | 'armor' | 'accessory') => void;
  setProfile: (partial: Partial<PlayerProfile>) => void;
  recordDefeats: (monstersKilled: number, alliesLost: number) => void;
  sellItem: (uid: string) => void;
  toggleLockItem: (uid: string) => void;
  claimQuest: (questId: string, reward: number) => void;
  updateHp: (hpMap: Record<string, number>) => void;
  restAtTown: (cost: number) => void;
  wipeData: () => void;
}

const DEFAULT_PITY: Record<BannerType, number> = { standard: 0, adventure: 0, demon: 0, beyond: 0, archive: 0 };
const DEFAULT_STATS: PlayerStats = { totalPulls: 0, coinsSpent: 0, rubiesSpent: 0, monstersDefeated: 0, teammatesPerished: 0, itemsObtained: 0 };
const DEFAULT_PROFILE: PlayerProfile = { name: '', pfp: 'default', favouriteCharId: '' };

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 1500,
      rubies: 10,
      shards: 0,
      ownedCounts: {},
      characterData: {},
      activeTeamIds: [],
      unlockedStageIds: [STAGES[0].id],
      lastPullResults: [],
      lastPullBanner: 'standard',
      items: { 'healing-herb': 3 },
      currentNodeId: 'tesialyrodi',
      inventory: [],
      equipped: {},
      pityCounters: { ...DEFAULT_PITY },
      playerStats: { ...DEFAULT_STATS },
      profile: { ...DEFAULT_PROFILE },
      claimedQuests: [],
      currentHp: {},

      pull: (count, banner) => {
        const state = get();
        const pity = { ...(state.pityCounters ?? DEFAULT_PITY) };
        const stats = { ...(state.playerStats ?? DEFAULT_STATS) };

        const results: PullResult[] = [];
        const newCounts = { ...state.ownedCounts };
        const newInventory = [...(state.inventory ?? [])];
        let currentPity = pity[banner] ?? 0;
        let itemsGot = 0;
        let shardsGained = 0;
        let coinsDelta = 0;

        if (banner === 'standard') {
          const cost = STANDARD_PULL_COST * count;
          if (state.coins < cost) return;
          coinsDelta = -cost;
          stats.coinsSpent += cost;
        } else {
          const rubyCost = banner === 'demon' ? DEMON_PULL_COST : banner === 'beyond' ? BEYOND_PULL_COST : banner === 'archive' ? ARCHIVE_PULL_COST : ADVENTURE_PULL_COST;
          const cost = rubyCost * count;
          if (state.rubies < cost) return;
          stats.rubiesSpent += cost;
        }

        for (let i = 0; i < count; i++) {
          currentPity++;
          const forceLegendary = currentPity >= PITY_THRESHOLD;
          const result = pullOne(banner, forceLegendary);
          results.push(result);

          if (result.type === 'character') {
            const c = result.character;
            const currentCount = newCounts[c.id] ?? 0;
            if (currentCount >= MAX_USEFUL_COPIES) {
              shardsGained += SHARD_VALUES[c.rarity] ?? 5;
            } else {
              if (currentCount > 0) coinsDelta += DUPLICATE_REFUND;
              newCounts[c.id] = currentCount + 1;
            }
            if (c.rarity === 'Legendary') currentPity = 0;
          } else {
            newInventory.push(result.item);
            itemsGot++;
            if (result.item.rarity === 'Legendary') currentPity = 0;
          }
        }

        pity[banner] = currentPity;
        stats.totalPulls += count;
        stats.itemsObtained += itemsGot;

        if (banner === 'standard') {
          const cost = STANDARD_PULL_COST * count;
          set({ coins: state.coins + coinsDelta, shards: (state.shards ?? 0) + shardsGained, ownedCounts: newCounts, inventory: newInventory, lastPullResults: results, lastPullBanner: 'standard', pityCounters: pity, playerStats: stats });
        } else {
          const rubyCost = banner === 'demon' ? DEMON_PULL_COST : banner === 'beyond' ? BEYOND_PULL_COST : banner === 'archive' ? ARCHIVE_PULL_COST : ADVENTURE_PULL_COST;
          const cost = rubyCost * count;
          set({ rubies: state.rubies - cost, coins: state.coins + coinsDelta, shards: (state.shards ?? 0) + shardsGained, ownedCounts: newCounts, inventory: newInventory, lastPullResults: results, lastPullBanner: banner, pityCounters: pity, playerStats: stats });
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

      buyXp: (id, times = 1) => {
        set((s) => {
          const n = Math.min(times, Math.floor(s.coins / TRAIN_COST));
          if (n <= 0) return s;
          const d = s.characterData[id] ?? { level: 1, xp: 0, enhancement: 0 };
          const newXp = d.xp + TRAIN_XP * n;
          return {
            coins: s.coins - TRAIN_COST * n,
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

      sellItem: (uid) => {
        set((s) => {
          const inv = s.inventory ?? [];
          const idx = inv.findIndex((it) => it.uid === uid);
          if (idx === -1) return s;
          const item = inv[idx];
          const baseValue: Record<string, number> = { Common: 50, Rare: 150, Epic: 500, Legendary: 2000 };
          const value = Math.round((baseValue[item.rarity] ?? 50) * (1 + item.level * 0.5));
          const newInv = inv.filter((it) => it.uid !== uid);
          const eq = { ...(s.equipped ?? {}) };
          for (const [cid, slots] of Object.entries(eq)) {
            if (slots[item.slot] === uid) {
              eq[cid] = { ...slots, [item.slot]: undefined };
            }
          }
          return { coins: s.coins + value, inventory: newInv, equipped: eq };
        });
      },

      toggleLockItem: (uid) => {
        set((s) => {
          const inv = s.inventory ?? [];
          const idx = inv.findIndex((it) => it.uid === uid);
          if (idx === -1) return s;
          const newInv = [...inv];
          newInv[idx] = { ...newInv[idx], locked: !newInv[idx].locked };
          return { inventory: newInv };
        });
      },

      recordDefeats: (monstersKilled, alliesLost) => {
        set((s) => {
          const stats = { ...(s.playerStats ?? DEFAULT_STATS) };
          stats.monstersDefeated += monstersKilled;
          stats.teammatesPerished += alliesLost;
          return { playerStats: stats };
        });
      },

      claimQuest: (questId, reward) => {
        set((s) => {
          const claimed = s.claimedQuests ?? [];
          if (claimed.includes(questId)) return s;
          return { rubies: s.rubies + reward, claimedQuests: [...claimed, questId] };
        });
      },

      updateHp: (hpMap) => {
        set((s) => ({ currentHp: { ...(s.currentHp ?? {}), ...hpMap } }));
      },

      restAtTown: (cost) => {
        set((s) => {
          if (s.coins < cost) return s;
          return { coins: s.coins - cost, currentHp: {} };
        });
      },

      wipeData: () => {
        set({
          coins: 1500,
          rubies: 10,
          shards: 0,
          ownedCounts: {},
          characterData: {},
          activeTeamIds: [],
          unlockedStageIds: [STAGES[0].id],
          lastPullResults: [],
          lastPullBanner: 'standard',
          items: { 'healing-herb': 3 },
          currentNodeId: 'tesialyrodi',
          inventory: [],
          equipped: {},
          pityCounters: { ...DEFAULT_PITY },
          playerStats: { ...DEFAULT_STATS },
          profile: { ...DEFAULT_PROFILE },
          claimedQuests: [],
          currentHp: {},
        });
      },
    }),
    { name: 'fleur-save-v3' }
  )
);
