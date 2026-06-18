import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import type { Character } from '../types';
import PageHeader from './PageHeader';

interface Props {
  onBack: () => void;
}

const RARITY_GRADIENT: Record<string, string> = {
  Common: 'from-slate-800 via-slate-700/60 to-slate-900',
  Rare: 'from-blue-950 via-blue-900/40 to-slate-900',
  Epic: 'from-purple-950 via-purple-900/40 to-slate-900',
  Legendary: 'from-amber-950 via-yellow-900/40 to-slate-900',
};

const RARITY_BORDER: Record<string, string> = {
  Common: 'border-slate-500/50',
  Rare: 'border-blue-500/60',
  Epic: 'border-purple-500/70',
  Legendary: 'border-yellow-500/80',
};

const RARITY_TEXT: Record<string, string> = {
  Common: 'text-slate-400',
  Rare: 'text-blue-300',
  Epic: 'text-purple-300',
  Legendary: 'text-yellow-300',
};

export default function PartyScreen({ onBack }: Props) {
  const ownedCounts = useGameStore((s) => s.ownedCounts);
  const activeTeamIds = useGameStore((s) => s.activeTeamIds);
  const characterData = useGameStore((s) => s.characterData);
  const setTeam = useGameStore((s) => s.setTeam);

  const [selectedSlot, setSelectedSlot] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const owned = CHARACTER_POOL.filter((c) => ownedCounts[c.id] > 0);

  function slotChar(idx: number): Character | null {
    return CHARACTER_POOL.find((c) => c.id === activeTeamIds[idx]) ?? null;
  }

  function slotData(idx: number) {
    const id = activeTeamIds[idx];
    return id ? (characterData[id] ?? { level: 1, xp: 0, enhancement: 0 }) : null;
  }

  function assignToSlot(charId: string) {
    const team: string[] = [
      activeTeamIds[0] ?? '',
      activeTeamIds[1] ?? '',
      activeTeamIds[2] ?? '',
    ];
    const existingIdx = team.indexOf(charId);
    if (existingIdx >= 0 && existingIdx !== selectedSlot) team[existingIdx] = '';
    team[selectedSlot] = charId;
    setTeam(team.filter(Boolean));
    setPickerOpen(false);
  }

  function clearSlot(idx: number) {
    const team: string[] = [
      activeTeamIds[0] ?? '',
      activeTeamIds[1] ?? '',
      activeTeamIds[2] ?? '',
    ];
    team[idx] = '';
    setTeam(team.filter(Boolean));
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#070d1a] text-slate-100">
      <PageHeader title="Party" onBack={onBack} />
      <div className="flex flex-1 overflow-hidden">
      {/* ── Left sidebar: slot list ── */}
      <aside className="flex w-56 flex-col border-r border-slate-800/60 bg-slate-950/60">
        {/* Slot list */}
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          {[0, 1, 2].map((idx) => {
            const char = slotChar(idx);
            const data = slotData(idx);
            const isSelected = selectedSlot === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedSlot(idx)}
                className={`flex items-center gap-2.5 rounded-xl p-2 text-left transition-all border ${
                  isSelected
                    ? 'border-yellow-600/50 bg-yellow-950/30'
                    : 'border-transparent hover:border-slate-700/60 hover:bg-slate-800/30'
                }`}
              >
                <span className={`w-6 text-center text-xs font-black ${isSelected ? 'text-yellow-500' : 'text-slate-600'}`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className={`h-14 w-10 flex-shrink-0 overflow-hidden rounded-lg border ${
                  char ? RARITY_BORDER[char.rarity] : 'border-dashed border-slate-700'
                } bg-slate-800`}>
                  {char?.image ? (
                    <img src={char.image} alt={char.name} className="h-full w-full object-cover object-top"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
                  ) : char ? (
                    <div className="flex h-full w-full items-center justify-center text-lg font-black text-slate-400">
                      {char.name.charAt(0)}
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl text-slate-700">+</div>
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-bold text-slate-200">
                    {char ? char.name.split(' ')[0] : 'Empty'}
                  </span>
                  {data && <span className="text-[10px] text-slate-500">Lv. {data.level}</span>}
                  {char && (
                    <div className="mt-0.5 flex gap-0.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span key={i} className={`text-[9px] ${i < (data?.enhancement ?? 0) ? 'text-yellow-400' : 'text-slate-800'}`}>★</span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-slate-800/60 p-3">
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full rounded-xl border border-yellow-700/40 bg-yellow-950/30 py-2 text-xs font-bold text-yellow-300 transition hover:bg-yellow-900/40"
          >
            {slotChar(selectedSlot) ? 'Change Character' : '+ Set Character'}
          </button>
          {slotChar(selectedSlot) && (
            <button
              onClick={() => clearSlot(selectedSlot)}
              className="w-full rounded-xl border border-slate-700/40 py-2 text-xs font-bold text-slate-500 transition hover:border-red-800/60 hover:text-red-400"
            >
              Remove
            </button>
          )}
        </div>
      </aside>

      {/* ── Main: portrait cards ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 items-stretch gap-3 p-4">
          {[0, 1, 2].map((idx) => {
            const char = slotChar(idx);
            const data = slotData(idx);
            const isSelected = selectedSlot === idx;

            return (
              <div
                key={idx}
                onClick={() => setSelectedSlot(idx)}
                className={`relative flex flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                  char
                    ? `bg-gradient-to-b ${RARITY_GRADIENT[char.rarity]} ${RARITY_BORDER[char.rarity]}`
                    : 'border-dashed border-slate-800 bg-slate-900/30'
                } ${
                  isSelected
                    ? 'scale-[1.02] ring-2 ring-yellow-400/70 shadow-xl shadow-yellow-500/10'
                    : 'hover:scale-[1.01]'
                }`}
              >
                {/* Slot badge */}
                <div className={`absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black ${
                  isSelected
                    ? 'border-yellow-500/60 bg-yellow-950/80 text-yellow-400'
                    : 'border-slate-700/50 bg-slate-900/60 text-slate-500'
                }`}>
                  {idx + 1}
                </div>

                {char ? (
                  <>
                    {/* Art area */}
                    <div className="flex-1 overflow-hidden flex items-center justify-center">
                      {char.image ? (
                        <img
                          src={char.image}
                          alt={char.name}
                          className="h-full w-full object-contain"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="select-none text-[130px] font-black leading-none text-white/[0.06]">
                            {char.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-10">
                      <div
                        style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                        className="truncate text-sm font-bold text-white"
                      >
                        {char.name}
                      </div>
                      <div className={`text-[10px] font-semibold ${RARITY_TEXT[char.rarity]}`}>
                        {char.rarity}
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex gap-0.5">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <span key={i} className={`text-xs ${i < (data?.enhancement ?? 0) ? 'text-yellow-400' : 'text-slate-700'}`}>★</span>
                          ))}
                        </div>
                        <div className="rounded-full border border-slate-700/40 bg-black/50 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                          Lv. {data?.level ?? 1}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-800">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-slate-800 text-4xl text-slate-700">
                      +
                    </div>
                    <div
                      style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                      className="text-xs font-semibold uppercase tracking-widest text-slate-700"
                    >
                      Slot {idx + 1}
                    </div>
                    <div className="text-[10px] text-slate-800">Unassigned</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between border-t border-slate-800/60 bg-slate-950/60 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600">Slot {selectedSlot + 1}</span>
            {slotChar(selectedSlot) && (
              <>
                <span className="text-slate-800">·</span>
                <span className={`text-sm font-semibold ${RARITY_TEXT[slotChar(selectedSlot)!.rarity]}`}>
                  {slotChar(selectedSlot)!.name}
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-slate-700">{activeTeamIds.length}/3 members</div>
        </div>
      </div>

      {/* ── Character Picker overlay ── */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/80 sm:items-center sm:justify-center"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full max-h-[75vh] overflow-y-auto rounded-t-3xl border border-slate-700 bg-slate-900 p-5 sm:max-w-lg sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="font-bold text-white">
                Choose for Slot {selectedSlot + 1}
              </h3>
              <button onClick={() => setPickerOpen(false)} className="text-xl leading-none text-slate-400 hover:text-white">✕</button>
            </div>

            {owned.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No characters yet — use the Contract!
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {owned.map((char) => {
                  const data = characterData[char.id] ?? { level: 1, xp: 0, enhancement: 0 };
                  const inSlot = activeTeamIds.indexOf(char.id);
                  return (
                    <button
                      key={char.id}
                      onClick={() => assignToSlot(char.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition hover:scale-105 ${RARITY_BORDER[char.rarity]} ${
                        inSlot >= 0 ? 'bg-slate-700/60' : 'bg-slate-800/60 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className={`h-16 w-full overflow-hidden rounded-lg border ${RARITY_BORDER[char.rarity]} bg-slate-700`}>
                        {char.image ? (
                          <img src={char.image} alt={char.name} className="h-full w-full object-cover object-top"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-400">
                            {char.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="w-full truncate text-center text-[10px] font-bold text-slate-200">
                        {char.name.split(' ')[0]}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[9px] font-semibold ${RARITY_TEXT[char.rarity]}`}>{char.rarity[0]}</span>
                        <span className="text-[9px] text-slate-500">Lv.{data.level}</span>
                      </div>
                      {inSlot >= 0 && (
                        <span className="text-[9px] font-bold text-yellow-400">Slot {inSlot + 1}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
