import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import { ADVENTURE_PULL_COST, DEMON_PULL_COST, STANDARD_PULL_COST } from '../systems/gacha';
import type { BannerType, Character, Rarity } from '../types';
import CurrencyBar from './CurrencyBar';

interface Props {
  onBack: () => void;
}

interface BannerConfig {
  id: BannerType;
  name: string;
  subtitle: string;
  tag: string;
  tagBg: string;
  bgGradient: string;
  glowColor: string;
  accentColor: string;
  titleColor: string;
  currencyIcon: string;
  currencyLabel: string;
  costPer: number;
  ratesText: string;
  featuredIds: string[];
  decorSymbol: string;
}

const BANNER_CONFIGS: BannerConfig[] = [
  {
    id: 'standard',
    name: 'Chronicles',
    subtitle: 'Standard Summoning',
    tag: 'PERMANENT',
    tagBg: 'bg-slate-600/90',
    bgGradient: 'linear-gradient(160deg, #1a1a28 0%, #0d0d1a 50%, #16140a 100%)',
    glowColor: 'rgba(200, 160, 40, 0.12)',
    accentColor: 'text-amber-400',
    titleColor: 'text-amber-100',
    currencyIcon: '🪙',
    currencyLabel: 'Coins',
    costPer: STANDARD_PULL_COST,
    ratesText: 'Common 60%  ·  Rare 30%  ·  Epic 8%  ·  Legendary 2%',
    featuredIds: [],
    decorSymbol: '✦',
  },
  {
    id: 'adventure',
    name: 'Adventure Begins',
    subtitle: 'Story Chapter I',
    tag: 'ENHANCED RATES',
    tagBg: 'bg-blue-700/90',
    bgGradient: 'linear-gradient(160deg, #0a1228 0%, #070d1a 50%, #0a1228 100%)',
    glowColor: 'rgba(60, 100, 220, 0.20)',
    accentColor: 'text-blue-300',
    titleColor: 'text-blue-100',
    currencyIcon: '💎',
    currencyLabel: 'Rubies',
    costPer: ADVENTURE_PULL_COST,
    ratesText: 'Common 40%  ·  Rare 40%  ·  Epic 15%  ·  Legendary 5%',
    featuredIds: ['fleur-theos', 'auxentios-brigach', 'roza-defteros', 'casilda'],
    decorSymbol: '◆',
  },
  {
    id: 'demon',
    name: 'Demon Kingdom Returns',
    subtitle: 'Limited Event',
    tag: 'LIMITED',
    tagBg: 'bg-red-800/90',
    bgGradient: 'linear-gradient(160deg, #1a0808 0%, #0c0408 50%, #1a0808 100%)',
    glowColor: 'rgba(200, 20, 20, 0.22)',
    accentColor: 'text-red-400',
    titleColor: 'text-red-100',
    currencyIcon: '💎',
    currencyLabel: 'Rubies',
    costPer: DEMON_PULL_COST,
    ratesText: 'Common 35%  ·  Rare 38%  ·  Epic 22%  ·  Legendary 5%',
    featuredIds: ['tomoe-yoshimi'],
    decorSymbol: '⚔',
  },
];

const RARITY_CARD: Record<Rarity, { border: string; from: string; to: string; glow: string; text: string }> = {
  Common:    { border: 'border-slate-500', from: 'from-slate-800', to: 'to-slate-900', glow: '',                      text: 'text-slate-300'  },
  Rare:      { border: 'border-blue-400',  from: 'from-blue-900',  to: 'to-slate-900', glow: 'shadow-blue-500/40',    text: 'text-blue-300'   },
  Epic:      { border: 'border-purple-400',from: 'from-purple-900',to: 'to-slate-900', glow: 'shadow-purple-500/50',  text: 'text-purple-300' },
  Legendary: { border: 'border-yellow-400',from: 'from-yellow-900',to: 'to-amber-950', glow: 'shadow-yellow-500/60',  text: 'text-yellow-300' },
};

const RARITY_SYM: Record<Rarity, string> = { Common: '◇', Rare: '◆', Epic: '✦', Legendary: '✸' };

export default function GachaScreen({ onBack }: Props) {
  const coins  = useGameStore((s) => s.coins);
  const rubies = useGameStore((s) => s.rubies);
  const pull   = useGameStore((s) => s.pull);

  const [bannerIdx, setBannerIdx]       = useState(0);
  const [pullResults, setPullResults]   = useState<Character[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showOverlay, setShowOverlay]   = useState(false);
  const touchStartX = useRef<number | null>(null);

  const banner    = BANNER_CONFIGS[bannerIdx];
  const balance   = banner.id === 'standard' ? coins : rubies;
  const canAfford1  = balance >= banner.costPer;
  const canAfford10 = balance >= banner.costPer * 10;

  useEffect(() => {
    if (!showOverlay || revealedCount >= pullResults.length) return;
    const delay = revealedCount === 0 ? 250 : 360;
    const t = setTimeout(() => setRevealedCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [showOverlay, revealedCount, pullResults.length]);

  function doPull(count: number) {
    pull(count, banner.id);
    const results = useGameStore.getState().lastPullResults;
    setPullResults(results);
    setRevealedCount(0);
    setShowOverlay(true);
  }

  function closeOverlay() {
    setShowOverlay(false);
    setPullResults([]);
    setRevealedCount(0);
  }

  function goPrev() { setBannerIdx((i) => (i > 0 ? i - 1 : BANNER_CONFIGS.length - 1)); }
  function goNext() { setBannerIdx((i) => (i < BANNER_CONFIGS.length - 1 ? i + 1 : 0)); }

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 48) { if (dx < 0) goNext(); else goPrev(); }
    touchStartX.current = null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#070d1a] text-slate-100">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-800 px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
        >
          ← Back
        </button>
        <span
          style={{ fontFamily: "'Cinzel', Georgia, serif" }}
          className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-600"
        >
          Contract
        </span>
        <CurrencyBar />
      </div>

      {/* Slider */}
      <div
        className="relative flex-1 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ minHeight: '360px' }}
      >
        {/* Track */}
        <div
          className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            width: `${BANNER_CONFIGS.length * 100}%`,
            transform: `translateX(-${bannerIdx * (100 / BANNER_CONFIGS.length)}%)`,
          }}
        >
          {BANNER_CONFIGS.map((b) => (
            <BannerPanel key={b.id} banner={b} />
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-xl text-white/50 backdrop-blur transition hover:bg-black/70 hover:text-white/80"
        >
          ‹
        </button>
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-xl text-white/50 backdrop-blur transition hover:bg-black/70 hover:text-white/80"
        >
          ›
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
          {BANNER_CONFIGS.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setBannerIdx(i)}
              className={`rounded-full transition-all duration-300 ${
                i === bannerIdx ? 'h-2 w-6 bg-white/80' : 'h-2 w-2 bg-white/25 hover:bg-white/45'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Pull controls */}
      <div className="flex-shrink-0 border-t border-slate-800/70 bg-slate-950/80 px-4 py-4">
        <div className="mb-3 text-center text-[11px] text-slate-600">{banner.ratesText}</div>
        <div className="flex justify-center gap-3">
          <button
            disabled={!canAfford1}
            onClick={() => doPull(1)}
            className={`flex w-36 flex-col items-center rounded-xl border py-3 text-sm font-bold transition ${
              canAfford1
                ? 'border-white/15 bg-white/8 text-white/80 hover:bg-white/[0.14]'
                : 'cursor-not-allowed border-white/5 bg-white/5 text-white/25'
            }`}
          >
            Pull ×1
            <span className="mt-0.5 text-xs font-normal opacity-60">
              {banner.currencyIcon} {banner.costPer.toLocaleString()}
            </span>
          </button>
          <button
            disabled={!canAfford10}
            onClick={() => doPull(10)}
            className={`flex w-36 flex-col items-center rounded-xl border py-3 text-sm font-bold transition ${
              canAfford10
                ? 'border-yellow-500/40 bg-yellow-950/50 text-yellow-200 hover:bg-yellow-900/60'
                : 'cursor-not-allowed border-white/5 bg-white/5 text-white/25'
            }`}
          >
            Pull ×10
            <span className="mt-0.5 text-xs font-normal opacity-60">
              {banner.currencyIcon} {(banner.costPer * 10).toLocaleString()}
            </span>
          </button>
        </div>
        {!canAfford1 && (
          <div className="mt-2 text-center text-[11px] text-red-400/80">
            Not enough {banner.currencyIcon} — need {banner.costPer.toLocaleString()} {banner.currencyLabel}
          </div>
        )}
      </div>

      {/* Pull overlay */}
      {showOverlay && (
        <PullOverlay
          results={pullResults}
          revealedCount={revealedCount}
          onSkip={() => setRevealedCount(pullResults.length)}
          onClose={closeOverlay}
        />
      )}
    </div>
  );
}

function BannerPanel({ banner }: { banner: BannerConfig }) {
  const featuredChars = banner.featuredIds
    .map((id) => CHARACTER_POOL.find((c) => c.id === id))
    .filter((c): c is Character => Boolean(c));

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-10"
      style={{ width: `${100 / BANNER_CONFIGS.length}%`, background: banner.bgGradient }}
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-3/4"
        style={{
          background: `radial-gradient(ellipse at 50% -10%, ${banner.glowColor} 0%, transparent 65%)`,
        }}
      />

      {/* Decorative watermark */}
      <div
        className={`pointer-events-none absolute right-5 top-5 select-none font-black leading-none opacity-[0.04] ${banner.accentColor}`}
        style={{ fontSize: '90px' }}
      >
        {banner.decorSymbol}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        {/* Tag chip */}
        <div className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/90 ${banner.tagBg}`}>
          {banner.tag}
        </div>

        {/* Banner name */}
        <div>
          <h2
            style={{ fontFamily: "'Cinzel Decorative', Georgia, serif" }}
            className={`text-2xl font-black leading-snug sm:text-3xl ${banner.titleColor}`}
          >
            {banner.name}
          </h2>
          <div className={`mt-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] opacity-60 ${banner.accentColor}`}>
            {banner.subtitle}
          </div>
        </div>

        {/* Featured portraits */}
        {featuredChars.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="flex gap-2">
              {featuredChars.slice(0, 4).map((c) => {
                const s = RARITY_CARD[c.rarity];
                return (
                  <div key={c.id} className="flex flex-col items-center gap-1">
                    <div className={`h-14 w-14 overflow-hidden rounded-xl border-2 bg-slate-800/80 ${s.border}`}>
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="h-full w-full object-cover object-top"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-400">
                          {c.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className={`text-[9px] font-bold ${s.text}`}>{RARITY_SYM[c.rarity]}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-1 text-left">
              <div className="text-[10px] font-black uppercase tracking-wider text-white/50">Featured</div>
              <div className="text-[10px] text-white/35">50% rate-up</div>
              <div className="text-[10px] italic text-white/20">when matching rarity</div>
            </div>
          </div>
        )}

        {/* Currency pill */}
        <div className={`rounded-full border border-current/20 px-4 py-1 text-xs font-semibold ${banner.accentColor}`}>
          {banner.currencyIcon} {banner.currencyLabel} · {banner.costPer} per pull
        </div>
      </div>
    </div>
  );
}

function PullOverlay({
  results,
  revealedCount,
  onSkip,
  onClose,
}: {
  results: Character[];
  revealedCount: number;
  onSkip: () => void;
  onClose: () => void;
}) {
  const allRevealed = revealedCount >= results.length;
  const isSingle = results.length === 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-lg px-4">
        {isSingle ? (
          <div className="mb-8 flex justify-center">
            {results.length > 0 && <ResultCard char={results[0]} revealed={revealedCount >= 1} large />}
          </div>
        ) : (
          <div className="mb-6 grid grid-cols-5 gap-2">
            {results.map((char, i) => (
              <ResultCard key={i} char={char} revealed={i < revealedCount} />
            ))}
          </div>
        )}

        <div className="flex justify-center">
          {!allRevealed ? (
            <button
              onClick={onSkip}
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-2 text-sm font-bold text-white/70 transition hover:bg-white/20"
            >
              Skip
            </button>
          ) : (
            <button
              onClick={onClose}
              className="rounded-xl border border-yellow-500/50 bg-yellow-950/60 px-8 py-2.5 text-sm font-bold text-yellow-300 transition hover:bg-yellow-900/70"
            >
              Continue ✦
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ char, revealed, large = false }: { char: Character; revealed: boolean; large?: boolean }) {
  const s = RARITY_CARD[char.rarity];
  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 bg-gradient-to-b shadow-lg transition-all duration-500 ${s.border} ${s.from} ${s.to} ${s.glow ? `shadow-lg ${s.glow}` : ''} ${
        large ? 'mx-auto h-56 w-44' : 'h-28 w-full'
      } ${revealed ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-3 opacity-0'}`}
    >
      <div className="absolute inset-0">
        {char.image ? (
          <img
            src={char.image}
            alt={char.name}
            className="h-full w-full object-cover object-top"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-black text-white/10"
            style={{ fontSize: large ? '4.5rem' : '2.5rem' }}
          >
            {char.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-1.5 pb-1.5 pt-6">
        <div className={`truncate text-center font-bold leading-tight text-white ${large ? 'text-sm' : 'text-[9px]'}`}>
          {char.name.split(' ')[0]}
        </div>
        <div className={`text-center ${large ? 'text-[11px]' : 'text-[8px]'} ${s.text}`}>
          {RARITY_SYM[char.rarity]} {char.rarity}
        </div>
      </div>
    </div>
  );
}
