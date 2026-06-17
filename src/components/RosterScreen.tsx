import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL, RARITY_COLORS } from '../data/characters';
import { effectiveStats, xpProgress, MAX_LEVEL, TRAIN_COST, TRAIN_XP } from '../systems/leveling';
import type { Character } from '../types';
import CurrencyBar from './CurrencyBar';

interface Props {
  onBack: () => void;
}

const RARITY_TEXT: Record<string, string> = {
  Common: 'text-gray-300',
  Rare: 'text-blue-300',
  Epic: 'text-purple-300',
  Legendary: 'text-yellow-300',
};

const RARITY_BG: Record<string, string> = {
  Common: 'from-slate-800 to-slate-900',
  Rare: 'from-blue-950 to-slate-900',
  Epic: 'from-purple-950 to-slate-900',
  Legendary: 'from-yellow-950 to-amber-950',
};

export default function PartyScreen({ onBack }: Props) {
  const ownedCounts = useGameStore((s) => s.ownedCounts);
  const activeTeamIds = useGameStore((s) => s.activeTeamIds);
  const characterData = useGameStore((s) => s.characterData);
  const coins = useGameStore((s) => s.coins);
  const setTeam = useGameStore((s) => s.setTeam);
  const enhance = useGameStore((s) => s.enhance);
  const buyXp = useGameStore((s) => s.buyXp);

  const [detailId, setDetailId] = useState<string | null>(null);

  const owned = CHARACTER_POOL.filter((c) => ownedCounts[c.id] > 0);
  const detailChar = detailId ? CHARACTER_POOL.find((c) => c.id === detailId) : null;
  const detailData = detailId ? (characterData[detailId] ?? { level: 1, xp: 0, enhancement: 0 }) : null;

  function toggle(id: string) {
    if (activeTeamIds.includes(id)) {
      setTeam(activeTeamIds.filter((t) => t !== id));
    } else if (activeTeamIds.length < 3) {
      setTeam([...activeTeamIds, id]);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={onBack}>← Back</button>
          <h2 style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-xl font-bold text-emerald-200">
            Party
          </h2>
        </div>
        <CurrencyBar />
      </div>

      <div className="flex flex-col gap-5 px-4 pt-4">
        {/* Active party — big slots */}
        <div>
          <div style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Active Party ({activeTeamIds.length}/3)
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((slot) => {
              const charId = activeTeamIds[slot];
              const char = charId ? CHARACTER_POOL.find((c) => c.id === charId) : null;
              const data = charId ? (characterData[charId] ?? { level: 1, xp: 0, enhancement: 0 }) : null;
              return (
                <div
                  key={slot}
                  onClick={() => char && setDetailId(char.id)}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition duration-150 ${
                    char
                      ? `${RARITY_COLORS[char.rarity]} bg-gradient-to-b ${RARITY_BG[char.rarity]} cursor-pointer hover:scale-105`
                      : 'border-slate-700 bg-slate-800/30 border-dashed'
                  }`}
                  style={{ minHeight: '160px' }}
                >
                  {char && data ? (
                    <>
                      <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-600 bg-slate-700">
                        {char.image ? (
                          <img src={char.image} alt={char.name} className="h-full w-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-4xl font-black text-slate-400">
                            {char.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-center text-xs font-bold leading-snug px-1">
                        {char.name}
                      </div>
                      <div className={`text-[10px] ${RARITY_TEXT[char.rarity]}`}>{char.rarity}</div>
                      <div className="flex gap-0.5">
                        {[0,1,2,3,4].map((i) => (
                          <span key={i} className={`text-sm ${i < data.enhancement ? 'text-yellow-400' : 'text-slate-700'}`}>★</span>
                        ))}
                      </div>
                      <div className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
                        Lv {data.level}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-600">
                      <span className="text-4xl">⊕</span>
                      <span className="text-xs">Empty</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Owned roster */}
        <div>
          <div style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Your Characters
          </div>
          {owned.length === 0 ? (
            <div className="text-slate-500 text-sm">No characters yet — try the Contract!</div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {owned.map((c) => {
                const data = characterData[c.id] ?? { level: 1, xp: 0, enhancement: 0 };
                const selected = activeTeamIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => { toggle(c.id); setDetailId(c.id); }}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 bg-slate-800/80 p-2 transition hover:scale-105 ${RARITY_COLORS[c.rarity]} ${selected ? 'ring-2 ring-white/50' : ''}`}
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-700">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="h-full w-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-black text-slate-400">{c.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="text-center text-[10px] font-semibold leading-tight">{c.name.split(' ')[0]}</div>
                    <div className="text-[9px] opacity-60">Lv {data.level}</div>
                    {ownedCounts[c.id] > 1 && (
                      <div className="text-[9px] text-yellow-400">×{ownedCounts[c.id]}</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Character detail panel */}
      {detailChar && detailData && (
        <DetailPanel
          char={detailChar}
          data={detailData}
          count={ownedCounts[detailChar.id] ?? 0}
          coins={coins}
          onClose={() => setDetailId(null)}
          onEnhance={() => enhance(detailChar.id)}
          onBuyXp={() => buyXp(detailChar.id)}
        />
      )}
    </div>
  );
}

// ─── Detail bottom panel ─────────────────────────────────────────────────────

function DetailPanel({
  char, data, count, coins, onClose, onEnhance, onBuyXp,
}: {
  char: Character;
  data: { level: number; xp: number; enhancement: number };
  count: number;
  coins: number;
  onClose: () => void;
  onEnhance: () => void;
  onBuyXp: () => void;
}) {
  const prog = xpProgress(data.xp);
  const scaled = effectiveStats(char.stats, data.level, data.enhancement);
  const xpBarPct = prog.needed > 0 ? Math.round((prog.current / prog.needed) * 100) : 100;
  const canEnhance = count >= 2 && data.enhancement < 5;
  const canTrain = coins >= TRAIN_COST && data.level < MAX_LEVEL;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t-2 border-slate-700 bg-slate-900 shadow-2xl">
      {/* Close bar */}
      <div className="sticky top-0 flex items-center justify-between bg-slate-900 px-5 py-3 border-b border-slate-800">
        <span style={{ fontFamily: "'Cinzel', Georgia, serif" }} className={`font-bold text-lg ${RARITY_TEXT[char.rarity]}`}>
          {char.name}
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
      </div>

      <div className="px-5 py-4 flex flex-col gap-5">
        {/* Portrait + identity */}
        <div className="flex gap-4 items-start">
          <div className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 ${RARITY_COLORS[char.rarity]}`}>
            {char.image ? (
              <img src={char.image} alt={char.name} className="h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-700 text-5xl font-black text-slate-400">
                {char.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className={`text-xs font-semibold ${RARITY_TEXT[char.rarity]}`}>{char.rarity}</div>
            <div className="flex gap-0.5">
              {[0,1,2,3,4].map((i) => (
                <span key={i} className={`text-base ${i < data.enhancement ? 'text-yellow-400' : 'text-slate-700'}`}>★</span>
              ))}
            </div>
            {char.description && (
              <p style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-xs italic text-slate-400 leading-relaxed max-w-xs">
                {char.description}
              </p>
            )}
          </div>
        </div>

        {/* Effective stats */}
        <div>
          <div style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Stats (Level {data.level})
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '❤️ HP', val: scaled.hp },
              { label: '⚔️ ATK', val: scaled.atk },
              { label: '🛡️ DEF', val: scaled.def },
              { label: '💨 SPD', val: scaled.speed },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between rounded-lg bg-slate-800 px-3 py-2 text-sm">
                <span className="text-slate-400">{label}</span>
                <span className="font-bold text-white">{val}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-400">
            <span className="text-slate-500">Skill: </span>
            <span className="text-white font-semibold">{char.skill.name}</span>
            <span className="ml-2 text-slate-500">{char.skill.type === 'magic' ? '✨ Magic' : '⚔️ Melee'} · {char.skill.multiplier}× · {char.skill.cooldown}-turn CD</span>
          </div>
        </div>

        {/* Level & XP */}
        <div>
          <div style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Level & Experience
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-white">Level {data.level}</span>
            {data.level < MAX_LEVEL && (
              <span className="text-xs text-slate-500">{prog.current} / {prog.needed} XP</span>
            )}
            {data.level >= MAX_LEVEL && (
              <span className="text-xs text-yellow-400">Max Level</span>
            )}
          </div>
          {data.level < MAX_LEVEL && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 mb-2">
              <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${xpBarPct}%` }} />
            </div>
          )}
          <button
            disabled={!canTrain}
            onClick={onBuyXp}
            className="w-full rounded-xl border border-blue-700/50 bg-blue-950/60 py-2 text-sm font-bold text-blue-200 transition hover:bg-blue-900/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            📚 Train (+{TRAIN_XP} XP) — {TRAIN_COST.toLocaleString()} 🪙
          </button>
        </div>

        {/* Enhancement */}
        <div>
          <div style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Enhancement ({data.enhancement}/5)
          </div>
          <div className="mb-2 text-xs text-slate-500">
            Each star adds +12% to all stats. Costs 1 duplicate copy.
            {count >= 2 && <span className="ml-1 text-yellow-400">You have {count}× copies.</span>}
          </div>
          <button
            disabled={!canEnhance}
            onClick={onEnhance}
            className="w-full rounded-xl border border-yellow-700/50 bg-yellow-950/60 py-2 text-sm font-bold text-yellow-200 transition hover:bg-yellow-900/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {data.enhancement >= 5 ? '★★★★★ Max Enhancement' : canEnhance ? `Enhance ★ (${count - 1} left after)` : 'Need a duplicate to enhance'}
          </button>
        </div>

        {/* Equipment slots */}
        <div>
          <div style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Equipment
          </div>
          {[
            { label: '⚔️ Weapon', slot: 'weapon' },
            { label: '🛡️ Armor', slot: 'armor' },
            { label: '💍 Accessory', slot: 'accessory' },
          ].map(({ label }) => (
            <div key={label} className="mb-1.5 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2">
              <span className="text-sm text-slate-400">{label}</span>
              <span className="text-xs italic text-slate-600">— Empty</span>
            </div>
          ))}
          <div className="text-[10px] italic text-slate-700">Equipment system coming soon.</div>
        </div>
      </div>
    </div>
  );
}
