import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import { SLOT_EMOJI, STAT_LABELS } from '../data/equipment';
import { effectiveStats, xpProgress, MAX_LEVEL, TRAIN_COST, TRAIN_XP } from '../systems/leveling';
import type { Character, EquipmentItem, Stats } from '../types';
import PageHeader from './PageHeader';

interface Props {
  onBack: () => void;
}

type TabId = 'overview' | 'enhance' | 'train' | 'equip';
type ProgData = { level: number; current: number; needed: number };

const NAV_TABS: { id: TabId; symbol: string; label: string }[] = [
  { id: 'overview', symbol: '◎', label: 'Info' },
  { id: 'enhance', symbol: '◆', label: 'Forge' },
  { id: 'train',   symbol: '◈', label: 'Train' },
  { id: 'equip',   symbol: '⬡', label: 'Equip' },
];

const RARITY_TEXT: Record<string, string> = {
  Common:    'text-slate-400',
  Rare:      'text-blue-300',
  Epic:      'text-purple-300',
  Legendary: 'text-yellow-300',
};

const RARITY_BORDER: Record<string, string> = {
  Common:    'border-slate-500/50',
  Rare:      'border-blue-500/60',
  Epic:      'border-purple-500/70',
  Legendary: 'border-yellow-500/80',
};

const RARITY_SYMBOL: Record<string, string> = {
  Common:    '◇',
  Rare:      '◆',
  Epic:      '✦',
  Legendary: '✸',
};

const ART_STYLE: Record<string, { bg: string; glow: string }> = {
  Common:    { bg: '#111520', glow: 'rgba(100,116,139,0.12)' },
  Rare:      { bg: '#0a1225', glow: 'rgba(59,130,246,0.18)'  },
  Epic:      { bg: '#0f0820', glow: 'rgba(147,51,234,0.20)'  },
  Legendary: { bg: '#1a1000', glow: 'rgba(234,179,8,0.18)'   },
};

const RARITY_PRIORITY: Record<string, number> = { Legendary: 4, Epic: 3, Rare: 2, Common: 1 };

function getClass(char: Character): string {
  if (char.skill.type === 'magic') return char.stats.physDef > 14 ? 'Battle Mage' : 'Mage';
  if (char.stats.critRate >= 14) return 'Assassin';
  if (char.stats.physDef > 14)  return 'Guardian';
  if (char.stats.physAtk > 26)  return 'Warrior';
  return 'Fighter';
}

export default function CharacterScreen({ onBack }: Props) {
  const ownedCounts  = useGameStore((s) => s.ownedCounts);
  const characterData = useGameStore((s) => s.characterData);
  const coins        = useGameStore((s) => s.coins);
  const enhance      = useGameStore((s) => s.enhance);
  const buyXp        = useGameStore((s) => s.buyXp);

  const owned = CHARACTER_POOL
    .filter((c) => ownedCounts[c.id] > 0)
    .sort((a, b) => {
      const lvDiff = (characterData[b.id]?.level ?? 1) - (characterData[a.id]?.level ?? 1);
      if (lvDiff !== 0) return lvDiff;
      return RARITY_PRIORITY[b.rarity] - RARITY_PRIORITY[a.rarity];
    });

  const [selectedCharId, setSelectedCharId] = useState<string | null>(owned[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const char   = selectedCharId ? CHARACTER_POOL.find((c) => c.id === selectedCharId) ?? null : null;
  const data   = selectedCharId ? (characterData[selectedCharId] ?? { level: 1, xp: 0, enhancement: 0 }) : null;
  const count  = selectedCharId ? (ownedCounts[selectedCharId] ?? 0) : 0;
  const scaled = char && data ? effectiveStats(char.stats, data.level, data.enhancement) : null;
  const prog   = data ? xpProgress(data.xp) : null;
  const xpBarPct = prog && prog.needed > 0 ? Math.min(100, Math.round((prog.current / prog.needed) * 100)) : 100;

  const canEnhance = count >= 2 && data !== null && data.enhancement < 5;
  const canTrain   = coins >= TRAIN_COST && data !== null && data.level < MAX_LEVEL;

  const artStyle = char ? ART_STYLE[char.rarity] : ART_STYLE.Common;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#070d1a] text-slate-100">
      <PageHeader title="Characters" onBack={onBack} />
      <div className="flex flex-1 overflow-hidden">

      {/* ── Far-left nav icons ── */}
      <nav className="flex w-20 flex-col items-center border-r border-slate-800/50 bg-slate-950/70 py-3">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            className={`mb-2 flex h-14 w-16 flex-col items-center justify-center gap-1 rounded-xl transition ${
              activeTab === tab.id
                ? 'border border-yellow-700/40 bg-yellow-950/50 text-yellow-400'
                : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <span className="text-2xl leading-none">{tab.symbol}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Info panel ── */}
      <div className="flex w-80 flex-col overflow-hidden border-r border-slate-800/50 bg-slate-950/40">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!char || !data || !scaled || !prog ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-700">
              <span className="text-5xl">◌</span>
              <div className="text-sm font-semibold">No Characters</div>
              <div className="max-w-[180px] text-center text-xs leading-relaxed">
                Use the Contract to summon your first character.
              </div>
            </div>
          ) : (
            <>
              {/* Character header (always shown) */}
              <div className="mb-5">
                <div className="mb-3 flex items-start gap-3">
                  <span className={`mt-1 text-3xl leading-none ${RARITY_TEXT[char.rarity]}`}>
                    {RARITY_SYMBOL[char.rarity]}
                  </span>
                  <div className="min-w-0">
                    <h2
                      style={{ fontFamily: "'Cinzel Decorative', Georgia, serif" }}
                      className="text-xl font-black leading-tight text-white"
                    >
                      {char.name}
                    </h2>
                    <div className={`mt-0.5 text-sm font-semibold ${RARITY_TEXT[char.rarity]}`}>
                      {char.rarity} · {getClass(char)}
                    </div>
                  </div>
                </div>

                {/* Enhancement diamonds */}
                <div className="mt-3 flex items-center gap-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-4 w-4 rotate-45 border-2 transition-all ${
                        i < data.enhancement
                          ? 'border-yellow-400 bg-yellow-400 shadow-sm shadow-yellow-400/50'
                          : 'border-slate-700 bg-transparent'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs text-slate-500">{data.enhancement}/5</span>
                </div>

                {/* Level */}
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-base font-bold text-slate-400">Lv.</span>
                  <span className="text-4xl font-black leading-none text-white">{data.level}</span>
                  <span className="text-base text-slate-700">/{MAX_LEVEL}</span>
                </div>
              </div>

              <div className="mb-5 h-px bg-slate-800/60" />

              {/* Tab content */}
              {activeTab === 'overview' && (
                <OverviewTab
                  char={char}
                  scaled={scaled}
                  prog={prog}
                  xpBarPct={xpBarPct}
                  canTrain={canTrain}
                  onTrain={(times) => buyXp(char.id, times)}
                  coins={coins}
                />
              )}
              {activeTab === 'enhance' && (
                <EnhanceTab
                  data={data}
                  count={count}
                  canEnhance={canEnhance}
                  onEnhance={() => enhance(char.id)}
                />
              )}
              {activeTab === 'train' && (
                <TrainTab
                  data={data}
                  prog={prog}
                  xpBarPct={xpBarPct}
                  canTrain={canTrain}
                  onTrain={(times) => buyXp(char.id, times)}
                  coins={coins}
                />
              )}
              {activeTab === 'equip' && <EquipTab charId={char.id} />}
            </>
          )}
        </div>
      </div>

      {/* ── Art display area ── */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${artStyle.glow} 0%, ${artStyle.bg} 55%, #070d1a 100%)`,
        }}
      >
        {char && (
          <>
            {/* Faint rarity watermark */}
            <div className={`absolute left-5 top-5 z-10 text-[10px] font-black uppercase tracking-[0.5em] opacity-15 ${RARITY_TEXT[char.rarity]}`}>
              {char.rarity}
            </div>

            {/* Character art */}
            <div className="absolute inset-0 flex items-end justify-center">
              {char.image ? (
                <img
                  src={char.image}
                  alt={char.name}
                  className="h-full max-w-full object-contain object-bottom"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="select-none font-black leading-none text-white opacity-[0.03]" style={{ fontSize: '35vw' }}>
                    {char.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#070d1a] to-transparent" />

            {/* Bottom name strip */}
            <div className="absolute inset-x-0 bottom-0 px-5 py-4">
              <div
                style={{ fontFamily: "'Cinzel Decorative', Georgia, serif" }}
                className="text-lg font-black text-white/20"
              >
                {char.name}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Right sidebar: character list ── */}
      <aside className="flex w-28 flex-col overflow-y-auto border-l border-slate-800/50 bg-slate-950/50">
        <div className="sticky top-0 border-b border-slate-800/50 bg-slate-950/80 px-2 py-2.5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Owned</span>
        </div>

        {owned.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-2">
            <span className="text-center text-xs text-slate-700">None yet</span>
          </div>
        ) : (
          owned.map((c) => {
            const d = characterData[c.id] ?? { level: 1, xp: 0, enhancement: 0 };
            const isSelected = c.id === selectedCharId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCharId(c.id)}
                className={`flex w-full flex-col items-center gap-1.5 border-b border-slate-800/30 px-2 py-3 transition ${
                  isSelected ? 'bg-yellow-950/25' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className={`h-16 w-16 overflow-hidden rounded-xl border-2 bg-slate-800 ${
                  isSelected ? 'border-yellow-500/60' : RARITY_BORDER[c.rarity]
                }`}>
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="h-full w-full object-cover object-top"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-400">
                      {c.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="max-w-full truncate text-center text-[11px] font-semibold text-slate-300">
                  {c.name.split(' ')[0]}
                </div>
                <div className={`text-[10px] font-semibold ${RARITY_TEXT[c.rarity]}`}>Lv.{d.level}</div>
                {isSelected && (
                  <div className="h-0.5 w-12 rounded-full bg-yellow-500/50" />
                )}
              </button>
            );
          })
        )}
      </aside>
      </div>
    </div>
  );
}

// ── Tab sub-components ─────────────────────────────────────────────────────────

function OverviewTab({ char, scaled, prog, xpBarPct, canTrain, onTrain, coins }: {
  char: Character;
  scaled: Stats;
  prog: ProgData;
  xpBarPct: number;
  canTrain: boolean;
  onTrain: (times: number) => void;
  coins: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Stats list */}
      <div>
        <div
          style={{ fontFamily: "'Cinzel', Georgia, serif" }}
          className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500"
        >
          Stats
        </div>
        {([
          { icon: '❤️', label: 'HP',       value: scaled.hp                   },
          { icon: '⚔️', label: 'Phys ATK', value: scaled.physAtk              },
          { icon: '✨', label: 'Mag ATK',  value: scaled.magAtk               },
          { icon: '🛡️', label: 'Phys DEF', value: scaled.physDef              },
          { icon: '🔮', label: 'Mag DEF',  value: scaled.magDef               },
          { icon: '🎯', label: 'Crit %',   value: `${scaled.critRate}%`       },
          { icon: '💨', label: 'Speed',    value: scaled.speed                },
        ] as const).map(({ icon, label, value }) => (
          <div key={label} className="flex items-center justify-between border-b border-slate-800/40 py-2.5 last:border-0">
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-5 text-center text-sm">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </div>
            <span className="text-sm font-bold text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* Skill */}
      <div className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-4">
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Signature Skill</div>
        <div className="text-base font-bold text-white">{char.skill.name}</div>
        <div className="mt-1 text-xs text-slate-400">
          {char.skill.type === 'magic' ? '✨ Magic' : '⚔️ Melee'}
          {' · '}{char.skill.multiplier}× damage
          {' · '}{char.skill.cooldown}-turn CD
        </div>
      </div>

      {/* Description */}
      {char.description && (
        <p style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-xs italic leading-relaxed text-slate-400">
          {char.description}
        </p>
      )}

      {/* Quick Train */}
      <div>
        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
          <span>XP Progress</span>
          {prog.needed > 0 && <span>{prog.current}/{prog.needed}</span>}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${xpBarPct}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {[
            { label: 'x1', times: 1 },
            { label: 'x5', times: 5 },
            { label: 'x10', times: 10 },
            { label: 'MAX', times: Math.floor(coins / TRAIN_COST) },
          ].map(({ label, times }) => {
            const effective = Math.min(times, Math.floor(coins / TRAIN_COST));
            return (
              <button
                key={label}
                disabled={!canTrain || effective <= 0}
                onClick={() => onTrain(effective)}
                className={`rounded-lg border py-2 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  label === 'MAX'
                    ? 'border-yellow-700/40 bg-yellow-950/40 text-yellow-300 hover:bg-yellow-900/50'
                    : 'border-blue-700/40 bg-blue-950/40 text-blue-300 hover:bg-blue-900/50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EnhanceTab({ data, count, canEnhance, onEnhance }: {
  data: { level: number; xp: number; enhancement: number };
  count: number;
  canEnhance: boolean;
  onEnhance: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Visual diamonds */}
      <div className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-4">
        <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-600">Enhancement Level</div>
        <div className="flex items-center justify-center gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-lg transition-all ${
                i < data.enhancement
                  ? 'border-yellow-500 bg-yellow-950/60 text-yellow-400 shadow-md shadow-yellow-500/25'
                  : 'border-slate-700 bg-slate-800/30 text-slate-700'
              }`}
            >
              {i < data.enhancement ? '◆' : '◇'}
            </div>
          ))}
        </div>
        <div className="mt-3 text-center text-xs text-slate-500">
          Level {data.enhancement}/5 · +{data.enhancement * 12}% to all stats
        </div>
      </div>

      {/* Effect table */}
      <div>
        <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-600">Enhancement Effects</div>
        {[1, 2, 3, 4, 5].map((lv) => (
          <div
            key={lv}
            className={`flex items-center justify-between border-b border-slate-800/30 py-2 text-xs last:border-0 ${
              lv <= data.enhancement ? 'text-yellow-300' : 'text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{lv <= data.enhancement ? '◆' : '◇'}</span>
              <span>Level {lv}</span>
            </div>
            <span>+{lv * 12}% all stats</span>
          </div>
        ))}
      </div>

      {/* Enhance action */}
      <div>
        <div className="mb-2 text-xs text-slate-500">
          Copies owned:{' '}
          <span className={count >= 2 ? 'font-bold text-yellow-400' : 'text-slate-400'}>{count}×</span>
          {count >= 2 && <span className="ml-2 text-slate-600">(1 consumed on enhance)</span>}
        </div>
        <button
          disabled={!canEnhance}
          onClick={onEnhance}
          className="w-full rounded-xl border border-yellow-700/40 bg-yellow-950/40 py-3 text-sm font-bold text-yellow-300 transition hover:bg-yellow-900/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {data.enhancement >= 5
            ? '◆◆◆◆◆ Max Enhanced'
            : canEnhance
              ? `Enhance ◆ — ${count - 1} copies remain`
              : 'Need a duplicate copy'}
        </button>
      </div>
    </div>
  );
}

function TrainTab({ data, prog, xpBarPct, canTrain, onTrain, coins }: {
  data: { level: number; xp: number; enhancement: number };
  prog: ProgData;
  xpBarPct: number;
  canTrain: boolean;
  onTrain: (times: number) => void;
  coins: number;
}) {
  const maxAffordable = Math.floor(coins / TRAIN_COST);

  return (
    <div className="flex flex-col gap-5">
      {/* Level status */}
      <div className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-4">
        <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-600">Level Progress</div>
        <div className="mb-3 flex items-end gap-1">
          <span className="text-3xl font-black leading-none text-white">{data.level}</span>
          <span className="mb-0.5 text-slate-600">/ {MAX_LEVEL}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
            style={{ width: `${xpBarPct}%` }}
          />
        </div>
        {data.level < MAX_LEVEL && prog.needed > 0 && (
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-600">
            <span>{prog.current} XP</span>
            <span>{prog.needed} XP to next level</span>
          </div>
        )}
        {data.level >= MAX_LEVEL && (
          <div className="mt-1.5 text-center text-[10px] font-bold text-yellow-400">Max Level Reached</div>
        )}
      </div>

      {/* Training session */}
      <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-4">
        <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-600">Training Session</div>
        <div className="mb-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Per session</span>
            <span className="font-semibold text-blue-400">+{TRAIN_XP} XP · {TRAIN_COST.toLocaleString()} 🪙</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Your balance</span>
            <span className={`font-semibold ${coins >= TRAIN_COST ? 'text-slate-300' : 'text-red-400'}`}>
              {coins.toLocaleString()} 🪙 ({maxAffordable} sessions)
            </span>
          </div>
        </div>
        {data.level >= MAX_LEVEL ? (
          <div className="text-center text-sm font-bold text-yellow-400 py-2">Max Level Reached</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'x1', times: 1 },
              { label: 'x5', times: 5 },
              { label: 'x10', times: 10 },
              { label: 'MAX', times: maxAffordable },
            ].map(({ label, times }) => {
              const effective = Math.min(times, maxAffordable);
              const cost = TRAIN_COST * effective;
              const disabled = !canTrain || effective <= 0;
              return (
                <button
                  key={label}
                  disabled={disabled}
                  onClick={() => onTrain(effective)}
                  className={`flex flex-col items-center rounded-xl border py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    label === 'MAX'
                      ? 'border-yellow-700/40 bg-yellow-950/40 text-yellow-300 hover:bg-yellow-900/50 col-span-2'
                      : 'border-blue-700/40 bg-blue-950/40 text-blue-300 hover:bg-blue-900/50'
                  }`}
                >
                  <span>Train {label}</span>
                  <span className="text-[10px] font-normal opacity-60">
                    +{(TRAIN_XP * effective).toLocaleString()} XP · {cost.toLocaleString()} 🪙
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[10px] italic leading-relaxed text-slate-700">
        Characters also gain XP from battles — half the stage's gold reward is shared among all active party members.
      </p>
    </div>
  );
}

const RARITY_RANK: Record<string, number> = { Legendary: 4, Epic: 3, Rare: 2, Common: 1 };
const EQUIP_RARITY_COL: Record<string, string> = { Common: 'text-slate-400', Rare: 'text-blue-300', Epic: 'text-purple-300', Legendary: 'text-yellow-300' };
const EQUIP_RARITY_BG: Record<string, string> = { Common: 'from-slate-900/60 to-slate-800/30', Rare: 'from-blue-950/50 to-slate-800/30', Epic: 'from-purple-950/50 to-slate-800/30', Legendary: 'from-yellow-950/50 to-slate-800/30' };
const EQUIP_RARITY_BORDER: Record<string, string> = { Common: 'border-slate-600/50', Rare: 'border-blue-500/50', Epic: 'border-purple-500/50', Legendary: 'border-yellow-500/60' };

function EquipTab({ charId }: { charId: string }) {
  const inventory = useGameStore((s) => s.inventory) ?? [];
  const equipped = useGameStore((s) => s.equipped) ?? {};
  const equipItem = useGameStore((s) => s.equipItem);
  const unequipItem = useGameStore((s) => s.unequipItem);
  const [pickerSlot, setPickerSlot] = useState<'weapon' | 'armor' | 'accessory' | null>(null);
  const [hoveredUid, setHoveredUid] = useState<string | null>(null);

  const charEquip = equipped[charId] ?? {};
  const slots: { key: 'weapon' | 'armor' | 'accessory'; emoji: string; label: string }[] = [
    { key: 'weapon', emoji: '⚔️', label: 'Weapon' },
    { key: 'armor', emoji: '🛡️', label: 'Armour' },
    { key: 'accessory', emoji: '💍', label: 'Accessory' },
  ];

  function getEquippedItem(slot: 'weapon' | 'armor' | 'accessory'): EquipmentItem | null {
    const uid = charEquip[slot];
    if (!uid) return null;
    return inventory.find((it) => it.uid === uid) ?? null;
  }

  const availableForSlot = pickerSlot
    ? [...inventory.filter((it) => it.slot === pickerSlot)].sort((a, b) => {
        const lvDiff = b.level - a.level;
        if (lvDiff !== 0) return lvDiff;
        return RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity];
      })
    : [];

  function getEquippedBy(uid: string): string | null {
    for (const [cid, slots] of Object.entries(equipped)) {
      if (slots?.weapon === uid || slots?.armor === uid || slots?.accessory === uid) return cid;
    }
    return null;
  }

  const hoveredItem = hoveredUid ? inventory.find((it) => it.uid === hoveredUid) ?? null : null;
  const hoveredEquippedBy = hoveredItem ? getEquippedBy(hoveredItem.uid) : null;
  const hoveredEquippedChar = hoveredEquippedBy ? CHARACTER_POOL.find((c) => c.id === hoveredEquippedBy) ?? null : null;

  return (
    <div className="flex flex-col gap-3">
      <div
        style={{ fontFamily: "'Cinzel', Georgia, serif" }}
        className="mb-1 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-600"
      >
        Equipment Slots
      </div>
      {slots.map(({ key, emoji, label }) => {
        const item = getEquippedItem(key);
        return (
          <div key={key} className="rounded-xl border border-slate-800/50 bg-slate-900/40 p-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border bg-slate-800/60 text-2xl ${item ? 'border-yellow-600/40' : 'border-slate-700/50 opacity-30'}`}>
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                {item ? (
                  <>
                    <div className="text-sm font-bold text-white truncate">{item.name}</div>
                    <div className={`text-[10px] font-semibold ${EQUIP_RARITY_COL[item.rarity]}`}>
                      {item.rarity} · +{item.level}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {STAT_LABELS[item.mainStat.stat]} +{item.mainStat.value}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-bold text-slate-500">{label}</div>
                    <div className="text-[10px] text-slate-700 italic">Empty</div>
                  </>
                )}
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setPickerSlot(key)}
                className="flex-1 rounded-lg border border-yellow-700/30 bg-yellow-950/30 py-1.5 text-[10px] font-bold text-yellow-300 transition hover:bg-yellow-900/40"
              >
                {item ? 'Change' : 'Equip'}
              </button>
              {item && (
                <button
                  onClick={() => unequipItem(charId, key)}
                  className="rounded-lg border border-slate-700/40 px-3 py-1.5 text-[10px] font-bold text-slate-500 transition hover:text-red-400"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Fullscreen item picker overlay */}
      {pickerSlot && (
        <div
          className="fixed inset-0 z-50 flex bg-black/85 backdrop-blur-sm"
          onClick={() => { setPickerSlot(null); setHoveredUid(null); }}
        >
          <div
            className="flex flex-1 flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/90 px-6 py-4">
              <div>
                <h3 style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-lg font-bold text-white">
                  Choose {pickerSlot.charAt(0).toUpperCase() + pickerSlot.slice(1)}
                </h3>
                <p className="text-[10px] text-slate-500">{availableForSlot.length} items available · Sorted by level, then rarity</p>
              </div>
              <button
                onClick={() => { setPickerSlot(null); setHoveredUid(null); }}
                className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-400 transition hover:bg-slate-700 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Item grid */}
              <div className="flex-1 overflow-y-auto p-6">
                {availableForSlot.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center text-slate-600">
                      <div className="text-4xl mb-2">{slots.find((s) => s.key === pickerSlot)?.emoji}</div>
                      <div className="text-sm font-semibold">No {pickerSlot}s in luggage</div>
                      <div className="text-xs mt-1">Pull from banners to get equipment</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {availableForSlot.map((it) => {
                      const eqBy = getEquippedBy(it.uid);
                      const eqChar = eqBy ? CHARACTER_POOL.find((c) => c.id === eqBy) : null;
                      return (
                      <button
                        key={it.uid}
                        onClick={() => { equipItem(charId, it.uid); setPickerSlot(null); setHoveredUid(null); }}
                        onMouseEnter={() => setHoveredUid(it.uid)}
                        onMouseLeave={() => setHoveredUid(null)}
                        className={`relative group flex flex-col items-center gap-2 rounded-2xl border-2 bg-gradient-to-b p-4 text-center transition-all duration-150 hover:scale-[1.04] ${EQUIP_RARITY_BORDER[it.rarity]} ${EQUIP_RARITY_BG[it.rarity]} ${hoveredUid === it.uid ? 'ring-2 ring-yellow-400/60' : ''}`}
                      >
                        {eqChar && (
                          <div className="absolute -right-1 -top-1 h-7 w-7 overflow-hidden rounded-full border-2 border-yellow-500/70 bg-slate-800 shadow-lg z-10" title={`Equipped by ${eqChar.name}`}>
                            {eqChar.image ? (
                              <img src={eqChar.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[9px] font-black text-slate-300">{eqChar.name.charAt(0)}</div>
                            )}
                          </div>
                        )}
                        <div className="text-3xl">{SLOT_EMOJI[it.slot]}</div>
                        <div className="w-full truncate text-sm font-bold text-white">{it.name}</div>
                        <div className={`text-xs font-semibold ${EQUIP_RARITY_COL[it.rarity]}`}>
                          {it.rarity}
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`text-[9px] ${i < it.level ? 'text-yellow-400' : 'text-slate-800'}`}>★</span>
                          ))}
                        </div>
                        <div className="mt-1 w-full rounded-lg bg-black/30 px-2 py-1 text-[11px] text-slate-300">
                          {STAT_LABELS[it.mainStat.stat]} <span className="font-bold text-yellow-300">+{it.mainStat.value}</span>
                        </div>
                        {it.subStats.length > 0 && (
                          <div className="text-[10px] text-slate-500">
                            +{it.subStats.length} sub stat{it.subStats.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right detail panel — shows on hover */}
              <div className="hidden w-72 flex-col border-l border-slate-800/60 bg-slate-950/70 lg:flex">
                {hoveredItem ? (
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="mb-4 flex flex-col items-center gap-2">
                      <div className="text-4xl">{SLOT_EMOJI[hoveredItem.slot]}</div>
                      <h4
                        style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                        className="text-base font-bold text-white text-center"
                      >
                        {hoveredItem.name}
                      </h4>
                      <div className={`text-sm font-semibold ${EQUIP_RARITY_COL[hoveredItem.rarity]}`}>
                        {hoveredItem.rarity} · {hoveredItem.slot.charAt(0).toUpperCase() + hoveredItem.slot.slice(1)}
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-3 w-3 rotate-45 border ${i < hoveredItem.level ? 'border-yellow-400 bg-yellow-400 shadow-sm shadow-yellow-400/50' : 'border-slate-700 bg-transparent'}`}
                          />
                        ))}
                        <span className="ml-1.5 text-xs text-slate-500">+{hoveredItem.level}/5</span>
                      </div>
                    </div>

                    {hoveredEquippedChar && (
                      <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-700/30 bg-yellow-950/20 px-3 py-2">
                        <div className="h-6 w-6 overflow-hidden rounded-full border border-yellow-600/50 bg-slate-700">
                          {hoveredEquippedChar.image ? (
                            <img src={hoveredEquippedChar.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[8px] font-black text-slate-300">{hoveredEquippedChar.name.charAt(0)}</div>
                          )}
                        </div>
                        <div className="text-[10px] text-yellow-300/80">
                          Equipped by <span className="font-bold text-yellow-200">{hoveredEquippedChar.name}</span>
                        </div>
                      </div>
                    )}

                    <div className="h-px bg-slate-800/60 mb-4" />

                    {/* Main stat */}
                    <div className="mb-4">
                      <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">Main Stat</div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                        <span className="text-sm font-semibold text-white">{STAT_LABELS[hoveredItem.mainStat.stat]}</span>
                        <span className="text-sm font-bold text-yellow-300">+{hoveredItem.mainStat.value}</span>
                      </div>
                    </div>

                    {/* Sub stats */}
                    <div>
                      <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                        Sub Stats ({hoveredItem.subStats.length}/5)
                      </div>
                      {hoveredItem.subStats.length === 0 ? (
                        <div className="text-xs text-slate-700 italic">No sub stats yet</div>
                      ) : (
                        hoveredItem.subStats.map((sub, i) => (
                          <div key={i} className="flex items-center justify-between border-b border-slate-800/30 py-2 last:border-0">
                            <span className="text-xs text-slate-400">{STAT_LABELS[sub.stat]}</span>
                            <span className="text-xs font-semibold text-slate-200">+{sub.value}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="text-center text-slate-700">
                      <div className="text-3xl mb-2">◌</div>
                      <div className="text-xs">Hover over an item</div>
                      <div className="text-[10px] text-slate-800 mt-1">to see full details</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
