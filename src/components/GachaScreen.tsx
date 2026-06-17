import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ADVENTURE_PULL_COST, STANDARD_PULL_COST } from '../systems/gacha';
import { RARITY_COLORS } from '../data/characters';
import type { BannerType, Character } from '../types';

interface Props {
  onBack: () => void;
}

const BANNERS: {
  id: BannerType;
  name: string;
  tag: string;
  emoji: string;
  currencyIcon: string;
  costPer: number;
  border: string;
  bg: string;
  headingClass: string;
  tagClass: string;
  desc: string;
  rates: string;
}[] = [
  {
    id: 'standard',
    name: 'Standard Summons',
    tag: 'PERMANENT',
    emoji: '📜',
    currencyIcon: '🪙',
    costPer: STANDARD_PULL_COST,
    border: 'border-blue-500/50',
    bg: 'from-blue-950/80 to-slate-900/90',
    headingClass: 'text-blue-200',
    tagClass: 'bg-blue-800/60 text-blue-300 border-blue-600/40',
    desc: 'Draw contracts from all known adventurers. Gems of courage flow freely here.',
    rates: 'Common 60% · Rare 30% · Epic 8% · Legendary 2%',
  },
  {
    id: 'adventure',
    name: 'Adventure Begins',
    tag: 'ENHANCED',
    emoji: '⚔️',
    currencyIcon: '💎',
    costPer: ADVENTURE_PULL_COST,
    border: 'border-amber-500/50',
    bg: 'from-amber-950/80 to-red-950/90',
    headingClass: 'text-amber-200',
    tagClass: 'bg-amber-800/60 text-amber-300 border-amber-600/40',
    desc: 'Rare ruby crystals resonate with destiny. Enhanced rates for the worthy.',
    rates: 'Common 40% · Rare 40% · Epic 15% · Legendary 5%',
  },
];

const RARITY_GLOW: Record<string, string> = {
  Common: 'shadow-slate-400/20',
  Rare: 'shadow-blue-400/50',
  Epic: 'shadow-purple-500/60',
  Legendary: 'shadow-yellow-400/70',
};

const RARITY_BG: Record<string, string> = {
  Common: 'from-slate-800 to-slate-900',
  Rare: 'from-blue-950 to-slate-900',
  Epic: 'from-purple-950 to-slate-900',
  Legendary: 'from-yellow-950 to-amber-950',
};

function PullCard({ character }: { character: Character }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-xl border-2 bg-gradient-to-b p-3 shadow-lg transition ${RARITY_COLORS[character.rarity]} ${RARITY_GLOW[character.rarity]} ${RARITY_BG[character.rarity]}`}
    >
      <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-slate-700/80">
        {character.image ? (
          <img
            src={character.image}
            alt={character.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-black text-slate-400">
            {character.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="text-center text-xs font-bold leading-tight">{character.name}</div>
      <div
        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${RARITY_COLORS[character.rarity]}`}
      >
        {character.rarity}
      </div>
    </div>
  );
}

export default function ContractScreen({ onBack }: Props) {
  const coins = useGameStore((s) => s.coins);
  const rubies = useGameStore((s) => s.rubies);
  const pull = useGameStore((s) => s.pull);
  const lastPullResults = useGameStore((s) => s.lastPullResults);
  const lastPullBanner = useGameStore((s) => s.lastPullBanner);

  const [selected, setSelected] = useState<BannerType>('standard');
  const [error, setError] = useState<string | null>(null);

  const activeBanner = BANNERS.find((b) => b.id === selected)!;

  function handlePull(count: number) {
    const cost = activeBanner.costPer * count;
    const balance = selected === 'standard' ? coins : rubies;
    const icon = activeBanner.currencyIcon;
    if (balance < cost) {
      setError(`Not enough ${icon} — need ${cost}, have ${balance}.`);
      return;
    }
    setError(null);
    pull(count, selected);
  }

  return (
    <div className="flex min-h-screen flex-col gap-5 p-5">
      <div className="flex items-center gap-3">
        <button className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <h2 className="text-xl font-bold text-purple-200">Contract</h2>
        <div className="ml-auto flex gap-3 text-sm">
          <span className="text-yellow-300">🪙 {coins.toLocaleString()}</span>
          <span className="text-red-300">💎 {rubies}</span>
        </div>
      </div>

      {/* Banner selection */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BANNERS.map((banner) => (
          <button
            key={banner.id}
            onClick={() => { setSelected(banner.id); setError(null); }}
            className={`flex flex-col gap-2 rounded-2xl border-2 bg-gradient-to-b p-5 text-left transition duration-150 ${banner.bg} ${banner.border} ${
              selected === banner.id
                ? 'ring-2 ring-white/30 scale-[1.02]'
                : 'opacity-70 hover:opacity-90'
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="text-4xl">{banner.emoji}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider ${banner.tagClass}`}>
                {banner.tag}
              </span>
            </div>
            <div className={`text-base font-bold ${banner.headingClass}`}>{banner.name}</div>
            <p className="text-xs text-slate-400 leading-relaxed">{banner.desc}</p>
            <div className="text-[10px] text-slate-500">{banner.rates}</div>
            <div className="mt-1 text-sm font-semibold text-slate-300">
              {banner.currencyIcon} {banner.costPer} per pull
            </div>
          </button>
        ))}
      </div>

      {/* Pull buttons */}
      <div className="flex justify-center gap-4">
        <button
          className="rounded-xl border border-slate-600 bg-slate-800 px-6 py-3 font-bold text-white shadow transition hover:scale-105 hover:bg-slate-700"
          onClick={() => handlePull(1)}
        >
          {activeBanner.currencyIcon} Pull ×1
          <span className="ml-1 text-xs font-normal opacity-60">({activeBanner.costPer})</span>
        </button>
        <button
          className="rounded-xl border border-slate-600 bg-slate-800 px-6 py-3 font-bold text-white shadow transition hover:scale-105 hover:bg-slate-700"
          onClick={() => handlePull(10)}
        >
          {activeBanner.currencyIcon} Pull ×10
          <span className="ml-1 text-xs font-normal opacity-60">({activeBanner.costPer * 10})</span>
        </button>
      </div>

      {error && <div className="text-center text-sm text-red-400">{error}</div>}

      {/* Pull results */}
      {lastPullResults.length > 0 && (
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs text-slate-500 uppercase tracking-widest">
            {lastPullBanner === 'adventure' ? '⚔️ Adventure Begins' : '📜 Standard Summons'} — Results
          </div>
          <div
            className={`grid gap-3 ${
              lastPullResults.length === 1
                ? 'grid-cols-1 max-w-[140px] mx-auto'
                : 'grid-cols-3 sm:grid-cols-5 max-w-3xl'
            }`}
          >
            {lastPullResults.map((c, i) => (
              <PullCard key={`${c.id}-${i}`} character={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
