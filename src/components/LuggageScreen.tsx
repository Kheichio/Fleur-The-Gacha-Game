import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import { SLOT_EMOJI, STAT_LABELS, UPGRADE_COSTS } from '../data/equipment';
import type { EquipmentItem, Rarity, StatKey } from '../types';
import CurrencyBar from './CurrencyBar';

interface Props {
  onBack: () => void;
}

type Category = 'all' | 'weapon' | 'armor' | 'accessory';
type SortKey = 'rarity' | 'level' | StatKey;

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'all',       label: 'All',         icon: '📦' },
  { id: 'weapon',    label: 'Weapons',     icon: '⚔️' },
  { id: 'armor',     label: 'Armor',       icon: '🛡️' },
  { id: 'accessory', label: 'Accessories', icon: '💍' },
];

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'rarity',   label: 'Rarity' },
  { id: 'level',    label: 'Level' },
  { id: 'hp',       label: 'HP' },
  { id: 'physAtk',  label: 'P.ATK' },
  { id: 'magAtk',   label: 'M.ATK' },
  { id: 'physDef',  label: 'P.DEF' },
  { id: 'magDef',   label: 'M.DEF' },
  { id: 'critRate', label: 'CRIT' },
  { id: 'speed',    label: 'SPD' },
];

const RARITY_RANK: Record<Rarity, number> = { Legendary: 4, Epic: 3, Rare: 2, Common: 1 };

const RARITY_BORDER: Record<Rarity, string> = {
  Common:    'border-slate-500/50',
  Rare:      'border-blue-500/60',
  Epic:      'border-purple-500/70',
  Legendary: 'border-yellow-500/80',
};

const RARITY_TEXT: Record<Rarity, string> = {
  Common:    'text-slate-400',
  Rare:      'text-blue-300',
  Epic:      'text-purple-300',
  Legendary: 'text-yellow-300',
};

const RARITY_BG: Record<Rarity, string> = {
  Common:    'from-slate-900/50 to-slate-800/30',
  Rare:      'from-blue-950/50 to-slate-800/30',
  Epic:      'from-purple-950/50 to-slate-800/30',
  Legendary: 'from-yellow-950/50 to-slate-800/30',
};

function getStatTotal(item: EquipmentItem, stat: StatKey): number {
  let total = 0;
  if (item.mainStat.stat === stat) total += item.mainStat.value;
  for (const sub of item.subStats) {
    if (sub.stat === stat) total += sub.value;
  }
  return total;
}

export default function LuggageScreen({ onBack }: Props) {
  const inventory = useGameStore((s) => s.inventory) ?? [];
  const equipped = useGameStore((s) => s.equipped) ?? {};
  const coins = useGameStore((s) => s.coins);
  const upgradeEquipment = useGameStore((s) => s.upgradeEquipment);
  const sellItem = useGameStore((s) => s.sellItem);
  const toggleLockItem = useGameStore((s) => s.toggleLockItem);

  const [category, setCategory] = useState<Category>('all');
  const [sortKey, setSortKey] = useState<SortKey>('rarity');
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  const filtered = inventory.filter((item) => category === 'all' || item.slot === category);
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'rarity') return RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity];
    if (sortKey === 'level') return b.level - a.level;
    return getStatTotal(b, sortKey) - getStatTotal(a, sortKey);
  });

  const selected = selectedUid ? inventory.find((it) => it.uid === selectedUid) ?? null : null;
  const canUpgrade = selected && selected.level < 5 && coins >= UPGRADE_COSTS[selected.level];

  function getEquippedBy(uid: string): string | null {
    for (const [charId, slots] of Object.entries(equipped)) {
      if (slots?.weapon === uid || slots?.armor === uid || slots?.accessory === uid) return charId;
    }
    return null;
  }

  function getCharThumb(charId: string) {
    return CHARACTER_POOL.find((c) => c.id === charId) ?? null;
  }

  const selectedEquippedBy = selected ? getEquippedBy(selected.uid) : null;
  const selectedEquippedChar = selectedEquippedBy ? getCharThumb(selectedEquippedBy) : null;
  const selectedProtected = selected ? (!!selectedEquippedBy || !!selected.locked) : false;

  return (
    <div className="flex h-screen overflow-hidden bg-[#070d1a] text-slate-100">
      {/* Left: categories + sort */}
      <aside className="flex w-52 flex-col border-r border-slate-800/60 bg-slate-950/60">
        <div className="border-b border-slate-800/60 p-4">
          <h2 style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-lg font-bold text-slate-100">
            Luggage
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-600">Item Storage</p>
        </div>

        <div className="border-b border-slate-800/60 px-4 py-2">
          <CurrencyBar />
        </div>

        {/* Categories */}
        <div className="border-b border-slate-800/60 p-3">
          <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-600">Category</div>
          <div className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.id); setSelectedUid(null); }}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  category === cat.id
                    ? 'border border-yellow-600/50 bg-yellow-950/30 text-yellow-300'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="ml-auto text-[10px] text-slate-600">
                  {inventory.filter((it) => cat.id === 'all' || it.slot === cat.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-600">Sort By</div>
          <div className="flex flex-wrap gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortKey(opt.id)}
                className={`rounded-md px-2 py-1 text-[10px] font-semibold transition ${
                  sortKey === opt.id
                    ? 'bg-yellow-950/40 text-yellow-300 border border-yellow-700/40'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Back */}
        <div className="border-t border-slate-800/60 p-3">
          <button
            onClick={onBack}
            className="w-full rounded-xl border border-slate-800 py-2 text-xs font-semibold text-slate-600 transition hover:text-slate-400"
          >
            ← Back to Hub
          </button>
        </div>
      </aside>

      {/* Center: item grid */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-slate-800/60 px-4 py-3">
          <span className="text-xs text-slate-500">{sorted.length} items</span>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-slate-700">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm font-semibold">No items yet</div>
              <div className="text-xs mt-1">Pull from banners to get equipment</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {sorted.map((item) => {
                const eqBy = getEquippedBy(item.uid);
                const eqChar = eqBy ? getCharThumb(eqBy) : null;
                return (
                  <button
                    key={item.uid}
                    onClick={() => setSelectedUid(item.uid)}
                    className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 bg-gradient-to-b p-3 transition hover:scale-105 ${
                      RARITY_BORDER[item.rarity]
                    } ${RARITY_BG[item.rarity]} ${
                      selectedUid === item.uid ? 'ring-2 ring-yellow-400/70' : ''
                    }`}
                  >
                    {/* Equipped character icon */}
                    {eqChar && (
                      <div className="absolute -right-1 -top-1 h-6 w-6 overflow-hidden rounded-full border-2 border-yellow-500/70 bg-slate-800 shadow">
                        {eqChar.image ? (
                          <img src={eqChar.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[8px] font-black text-slate-300">{eqChar.name.charAt(0)}</div>
                        )}
                      </div>
                    )}
                    {/* Lock icon */}
                    {item.locked && !eqBy && (
                      <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-cyan-500/60 bg-slate-800 text-[10px] shadow">
                        🔒
                      </div>
                    )}
                    <div className="text-2xl">{SLOT_EMOJI[item.slot]}</div>
                    <div className="w-full truncate text-center text-[11px] font-bold text-slate-200">
                      {item.name}
                    </div>
                    <div className={`text-[10px] font-semibold ${RARITY_TEXT[item.rarity]}`}>
                      {item.rarity}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {STAT_LABELS[item.mainStat.stat]} +{item.mainStat.value}
                    </div>
                    {item.level > 0 && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-[8px] ${i < item.level ? 'text-yellow-400' : 'text-slate-800'}`}>★</span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: detail panel */}
      <aside className="flex w-72 flex-col border-l border-slate-800/60 bg-slate-950/40">
        {selected ? (
          <div className="flex flex-1 flex-col overflow-y-auto p-4">
            <div className="mb-4 flex flex-col items-center gap-2">
              <div className="text-4xl">{SLOT_EMOJI[selected.slot]}</div>
              <h3
                style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                className="text-lg font-bold text-white text-center"
              >
                {selected.name}
              </h3>
              <div className={`text-sm font-semibold ${RARITY_TEXT[selected.rarity]}`}>
                {selected.rarity} · {selected.slot.charAt(0).toUpperCase() + selected.slot.slice(1)}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 rotate-45 border transition-all ${
                      i < selected.level
                        ? 'border-yellow-400 bg-yellow-400 shadow-sm shadow-yellow-400/50'
                        : 'border-slate-700 bg-transparent'
                    }`}
                  />
                ))}
                <span className="ml-1.5 text-xs text-slate-500">+{selected.level}/5</span>
              </div>
            </div>

            {/* Equipped by */}
            {selectedEquippedChar && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-700/30 bg-yellow-950/20 px-3 py-2">
                <div className="h-7 w-7 overflow-hidden rounded-full border border-yellow-600/50 bg-slate-700">
                  {selectedEquippedChar.image ? (
                    <img src={selectedEquippedChar.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] font-black text-slate-300">{selectedEquippedChar.name.charAt(0)}</div>
                  )}
                </div>
                <div className="text-[11px] text-yellow-300/80">
                  Equipped by <span className="font-bold text-yellow-200">{selectedEquippedChar.name}</span>
                </div>
              </div>
            )}

            <div className="h-px bg-slate-800/60 mb-4" />

            {/* Main stat */}
            <div className="mb-4">
              <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">Main Stat</div>
              <div className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                <span className="text-sm font-semibold text-white">{STAT_LABELS[selected.mainStat.stat]}</span>
                <span className="text-sm font-bold text-yellow-300">+{selected.mainStat.value}</span>
              </div>
            </div>

            {/* Sub stats */}
            <div className="mb-4">
              <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                Sub Stats ({selected.subStats.length}/5)
              </div>
              {selected.subStats.length === 0 ? (
                <div className="text-xs text-slate-700 italic">Upgrade to unlock sub stats</div>
              ) : (
                selected.subStats.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-800/30 py-1.5 last:border-0">
                    <span className="text-xs text-slate-400">{STAT_LABELS[sub.stat]}</span>
                    <span className="text-xs font-semibold text-slate-200">+{sub.value}</span>
                  </div>
                ))
              )}
            </div>

            <div className="h-px bg-slate-800/60 mb-4" />

            {/* Upgrade */}
            {selected.level < 5 ? (
              <div>
                <div className="mb-2 text-xs text-slate-500">
                  Upgrade cost: <span className="font-bold text-yellow-400">{UPGRADE_COSTS[selected.level].toLocaleString()} 🪙</span>
                </div>
                <div className="mb-2 text-[10px] text-slate-600">
                  +20% main stat · +15% all subs · +1 new sub stat
                </div>
                <button
                  disabled={!canUpgrade}
                  onClick={() => upgradeEquipment(selected.uid)}
                  className="w-full rounded-xl border border-yellow-700/40 bg-yellow-950/40 py-3 text-sm font-bold text-yellow-300 transition hover:bg-yellow-900/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {canUpgrade ? `Upgrade to +${selected.level + 1}` : coins < UPGRADE_COSTS[selected.level] ? 'Not enough coins' : 'Upgrade'}
                </button>
              </div>
            ) : (
              <div className="text-center text-sm font-bold text-yellow-400">★ Max Level ★</div>
            )}

            <div className="h-px bg-slate-800/60 my-4" />

            {/* Lock + Sell */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => toggleLockItem(selected.uid)}
                className={`w-full rounded-xl border py-2.5 text-xs font-bold transition ${
                  selected.locked
                    ? 'border-cyan-600/50 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40'
                    : 'border-slate-700/40 bg-slate-800/30 text-slate-500 hover:text-cyan-300 hover:border-cyan-700/40'
                }`}
              >
                {selected.locked ? '🔒 Locked — Tap to Unlock' : '🔓 Unlocked — Tap to Lock'}
              </button>

              {selectedProtected ? (
                <div className="w-full rounded-xl border border-slate-800/30 bg-slate-900/20 py-2.5 text-center text-xs text-slate-700">
                  {selectedEquippedBy ? 'Cannot sell — equipped' : 'Cannot sell — locked'}
                </div>
              ) : (
                (() => {
                  const baseValue: Record<string, number> = { Common: 50, Rare: 150, Epic: 500, Legendary: 2000 };
                  const sellValue = Math.round((baseValue[selected.rarity] ?? 50) * (1 + selected.level * 0.5));
                  return (
                    <button
                      onClick={() => { sellItem(selected.uid); setSelectedUid(null); }}
                      className="w-full rounded-xl border border-red-900/40 bg-red-950/20 py-2.5 text-xs font-bold text-red-400/70 transition hover:bg-red-950/40 hover:text-red-300"
                    >
                      Sell for {sellValue.toLocaleString()} 🪙
                    </button>
                  );
                })()
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-slate-700">
              <div className="text-3xl mb-2">◌</div>
              <div className="text-xs">Select an item</div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
