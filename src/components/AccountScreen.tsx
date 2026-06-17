import { useState } from 'react';
import { useGameStore, type PlayerProfile } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import type { Rarity } from '../types';
import CurrencyBar from './CurrencyBar';

interface Props {
  onBack: () => void;
}

const PFP_OPTIONS = [
  { id: 'default', label: 'Default', display: '👤' },
  { id: 'knight', label: 'Knight', display: '⚔️' },
  { id: 'mage', label: 'Mage', display: '✨' },
  { id: 'crown', label: 'Crown', display: '👑' },
  { id: 'skull', label: 'Skull', display: '💀' },
  { id: 'star', label: 'Star', display: '⭐' },
  { id: 'fire', label: 'Fire', display: '🔥' },
  { id: 'moon', label: 'Moon', display: '🌙' },
];

const RARITY_ORDER: Rarity[] = ['Legendary', 'Epic', 'Rare', 'Common'];

const RARITY_TEXT: Record<string, string> = {
  Common: 'text-slate-400',
  Rare: 'text-blue-300',
  Epic: 'text-purple-300',
  Legendary: 'text-yellow-300',
};

export default function AccountScreen({ onBack }: Props) {
  const profile = useGameStore((s) => s.profile) ?? { name: '', pfp: 'default', favouriteCharId: '' };
  const playerStats = useGameStore((s) => s.playerStats) ?? { totalPulls: 0, coinsSpent: 0, rubiesSpent: 0, monstersDefeated: 0, teammatesPerished: 0, itemsObtained: 0 };
  const ownedCounts = useGameStore((s) => s.ownedCounts);
  const inventory = useGameStore((s) => s.inventory) ?? [];
  const setProfile = useGameStore((s) => s.setProfile);
  const wipeData = useGameStore((s) => s.wipeData);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [showPfpPicker, setShowPfpPicker] = useState(false);
  const [showFavPicker, setShowFavPicker] = useState(false);

  const owned = CHARACTER_POOL.filter((c) => ownedCounts[c.id] > 0);
  const currentPfp = PFP_OPTIONS.find((p) => p.id === profile.pfp) ?? PFP_OPTIONS[0];
  const favChar = profile.favouriteCharId ? CHARACTER_POOL.find((c) => c.id === profile.favouriteCharId) : null;

  const charsByRarity: Record<Rarity, number> = { Common: 0, Rare: 0, Epic: 0, Legendary: 0 };
  for (const c of CHARACTER_POOL) {
    if (ownedCounts[c.id] > 0) charsByRarity[c.rarity]++;
  }
  const totalUnlocked = owned.length;

  function saveName() {
    setProfile({ name: nameInput.trim() });
    setEditingName(false);
  }

  function confirmWipe() {
    wipeData();
    setShowWipeConfirm(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#070d1a] text-slate-100">
      {/* Left panel — profile */}
      <div className="flex w-80 flex-col border-r border-slate-800/60 bg-slate-950/60">
        <div className="border-b border-slate-800/60 p-4">
          <h2 style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-lg font-bold text-slate-100">
            Account
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-600">Player Profile</p>
        </div>

        <div className="border-b border-slate-800/60 px-4 py-2">
          <CurrencyBar />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Profile picture */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <button
              onClick={() => setShowPfpPicker(true)}
              className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-yellow-600/40 bg-slate-800/60 text-5xl transition hover:border-yellow-400/60 hover:bg-slate-700/60"
            >
              {currentPfp.display}
            </button>
            <button
              onClick={() => setShowPfpPicker(true)}
              className="text-[10px] font-semibold text-yellow-400/60 hover:text-yellow-300"
            >
              Change Avatar
            </button>
          </div>

          {/* Name */}
          <div className="mb-5">
            <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">Player Name</div>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={20}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white outline-none focus:border-yellow-600"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') saveName(); }}
                />
                <button onClick={saveName} className="rounded-lg bg-yellow-950/50 px-3 text-xs font-bold text-yellow-300 hover:bg-yellow-900/50">
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setNameInput(profile.name); setEditingName(true); }}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-left text-sm text-white transition hover:border-slate-700"
              >
                {profile.name || <span className="italic text-slate-600">Set your name...</span>}
              </button>
            )}
          </div>

          {/* Favourite character */}
          <div className="mb-5">
            <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">Favourite Character</div>
            <button
              onClick={() => setShowFavPicker(true)}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-left text-sm transition hover:border-slate-700"
            >
              {favChar ? (
                <>
                  <div className="h-8 w-8 overflow-hidden rounded-full border border-slate-600 bg-slate-700">
                    {favChar.image ? (
                      <img src={favChar.image} alt={favChar.name} className="h-full w-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-black text-slate-400">{favChar.name.charAt(0)}</div>
                    )}
                  </div>
                  <span className={`font-semibold ${RARITY_TEXT[favChar.rarity]}`}>{favChar.name}</span>
                </>
              ) : (
                <span className="italic text-slate-600">Choose a favourite...</span>
              )}
            </button>
          </div>

          <div className="h-px bg-slate-800/60 mb-5" />

          {/* Back + Wipe */}
          <button
            onClick={onBack}
            className="mb-3 w-full rounded-xl border border-slate-800 py-2 text-xs font-semibold text-slate-600 transition hover:text-slate-400"
          >
            ← Back to Hub
          </button>
          <button
            onClick={() => setShowWipeConfirm(true)}
            className="w-full rounded-xl border border-red-900/40 bg-red-950/20 py-2 text-xs font-bold text-red-500/70 transition hover:bg-red-950/40 hover:text-red-400"
          >
            Wipe All Data
          </button>
        </div>
      </div>

      {/* Right panel — stats */}
      <div className="flex flex-1 flex-col overflow-y-auto p-6">
        <h3
          style={{ fontFamily: "'Cinzel', Georgia, serif" }}
          className="mb-6 text-xl font-bold text-white"
        >
          Player Statistics
        </h3>

        {/* Main stats grid */}
        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard icon="🎲" label="Total Pulls" value={playerStats.totalPulls.toLocaleString()} />
          <StatCard icon="🪙" label="Coins Spent" value={playerStats.coinsSpent.toLocaleString()} />
          <StatCard icon="💎" label="Rubies Spent" value={playerStats.rubiesSpent.toLocaleString()} />
          <StatCard icon="💀" label="Monsters Defeated" value={playerStats.monstersDefeated.toLocaleString()} />
          <StatCard icon="🪦" label="Teammates Perished" value={playerStats.teammatesPerished.toLocaleString()} />
          <StatCard icon="📦" label="Items Obtained" value={playerStats.itemsObtained.toLocaleString()} />
        </div>

        {/* Characters unlocked */}
        <div className="mb-6">
          <div
            style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500"
          >
            Characters Unlocked — {totalUnlocked}/{CHARACTER_POOL.length}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RARITY_ORDER.map((rarity) => {
              const total = CHARACTER_POOL.filter((c) => c.rarity === rarity).length;
              const unlocked = charsByRarity[rarity];
              return (
                <div key={rarity} className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-center">
                  <div className={`text-2xl font-black ${RARITY_TEXT[rarity]}`}>{unlocked}</div>
                  <div className="text-[10px] text-slate-500">/ {total}</div>
                  <div className={`mt-1 text-xs font-semibold ${RARITY_TEXT[rarity]}`}>{rarity}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipment count */}
        <div>
          <div
            style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500"
          >
            Equipment Inventory
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
            <div className="text-3xl font-black text-white">{inventory.length}</div>
            <div className="text-xs text-slate-500">items in luggage</div>
          </div>
        </div>
      </div>

      {/* Wipe confirmation modal */}
      {showWipeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowWipeConfirm(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-red-900/60 bg-slate-900 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-lg font-bold text-red-400">Wipe All Data?</h3>
            <p className="mb-5 text-sm text-slate-400">
              This will permanently erase all progress: characters, items, currency, and stats. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmWipe}
                className="flex-1 rounded-xl border border-red-800 bg-red-950/60 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-900/70"
              >
                Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PFP picker modal */}
      {showPfpPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowPfpPicker(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-base font-bold text-white">Choose Avatar</h3>
            <div className="grid grid-cols-4 gap-3">
              {PFP_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setProfile({ pfp: opt.id }); setShowPfpPicker(false); }}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition hover:scale-105 ${
                    profile.pfp === opt.id ? 'border-yellow-500 bg-yellow-950/40' : 'border-slate-700 bg-slate-800/60 hover:bg-slate-700/60'
                  }`}
                >
                  <span className="text-3xl">{opt.display}</span>
                  <span className="text-[9px] text-slate-400">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Favourite character picker */}
      {showFavPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowFavPicker(false)}>
          <div className="max-h-[70vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-base font-bold text-white">Choose Favourite Character</h3>
            {owned.length === 0 ? (
              <p className="text-sm text-slate-500">No characters owned yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {owned.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setProfile({ favouriteCharId: c.id }); setShowFavPicker(false); }}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition hover:scale-105 ${
                      profile.favouriteCharId === c.id ? 'border-yellow-500 bg-yellow-950/30' : 'border-slate-700 bg-slate-800/60'
                    }`}
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-600 bg-slate-700">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="h-full w-full object-cover object-top"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-black text-slate-400">{c.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="w-full truncate text-center text-[10px] font-bold text-slate-200">{c.name.split(' ')[0]}</div>
                    <div className={`text-[9px] font-semibold ${RARITY_TEXT[c.rarity]}`}>{c.rarity}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="text-xl font-black text-white">{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}
