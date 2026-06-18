import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import { ADVENTURE_PULL_COST, ARCHIVE_PULL_COST, BEYOND_PULL_COST, DEMON_PULL_COST, STANDARD_PULL_COST, PITY_THRESHOLD } from '../systems/gacha';
import { SLOT_EMOJI, STAT_LABELS } from '../data/equipment';
import { playLegendaryReveal } from '../systems/audio';
import type { BannerType, Character, EquipmentItem, PullResult, Rarity } from '../types';
import CurrencyBar from './CurrencyBar';
import PageHeader from './PageHeader';

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
    ratesText: 'Common 65%  ·  Rare 28%  ·  Epic 6.5%  ·  Legendary 0.5%',
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
    ratesText: 'Common 51%  ·  Rare 35%  ·  Epic 13.5%  ·  Legendary 0.5%',
    featuredIds: ['auxentios-brigach', 'roza-defteros', 'casilda'],
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
    ratesText: 'Common 46.5%  ·  Rare 34%  ·  Epic 19%  ·  Legendary 0.5%',
    featuredIds: ['tomoe-yoshimi'],
    decorSymbol: '⚔',
  },
  {
    id: 'beyond',
    name: 'Beyond the Boundaries of Comprehension',
    subtitle: 'Chapter 5',
    tag: 'LIMITED',
    tagBg: 'bg-violet-800/90',
    bgGradient: 'linear-gradient(160deg, #0d0620 0%, #08041a 50%, #120830 100%)',
    glowColor: 'rgba(140, 60, 220, 0.25)',
    accentColor: 'text-violet-300',
    titleColor: 'text-violet-100',
    currencyIcon: '💎',
    currencyLabel: 'Rubies',
    costPer: BEYOND_PULL_COST,
    ratesText: 'Common 46.5%  ·  Rare 34%  ·  Epic 19%  ·  Legendary 0.5%',
    featuredIds: ['anwaltin-von-berater'],
    decorSymbol: '◉',
  },
  {
    id: 'archive',
    name: "Fleur's Archive",
    subtitle: 'The Demi-God Awakens',
    tag: 'LIMITED',
    tagBg: 'bg-amber-700/90',
    bgGradient: 'linear-gradient(160deg, #1a1508 0%, #0d0a04 50%, #1a1208 100%)',
    glowColor: 'rgba(234, 179, 8, 0.20)',
    accentColor: 'text-amber-300',
    titleColor: 'text-amber-100',
    currencyIcon: '💎',
    currencyLabel: 'Rubies',
    costPer: ARCHIVE_PULL_COST,
    ratesText: 'Common 46.5%  ·  Rare 34%  ·  Epic 19%  ·  Legendary 0.5%',
    featuredIds: ['fleur-theos'],
    decorSymbol: '✸',
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
  const pityCounters = useGameStore((s) => s.pityCounters) ?? { standard: 0, adventure: 0, demon: 0, beyond: 0, archive: 0 };

  const [bannerIdx, setBannerIdx]       = useState(0);
  const [pullResults, setPullResults]   = useState<PullResult[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showOverlay, setShowOverlay]   = useState(false);
  const [legendaryChar, setLegendaryChar] = useState<Character | null>(null);
  const [legendaryDone, setLegendaryDone] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const banner    = BANNER_CONFIGS[bannerIdx];
  const balance   = banner.id === 'standard' ? coins : rubies;
  const canAfford1  = balance >= banner.costPer;
  const canAfford10 = balance >= banner.costPer * 10;
  const pity = pityCounters[banner.id] ?? 0;

  useEffect(() => {
    if (!showOverlay || legendaryChar || revealedCount >= pullResults.length) return;
    const delay = revealedCount === 0 ? 400 : 500;
    const t = setTimeout(() => setRevealedCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [showOverlay, revealedCount, pullResults.length, legendaryChar]);

  function doPull(count: number) {
    pull(count, banner.id);
    const results = useGameStore.getState().lastPullResults;
    setPullResults(results);
    setRevealedCount(0);
    setLegendaryDone(false);

    const firstLegendary = results.find(
      (r) => r.type === 'character' && r.character.rarity === 'Legendary'
    );
    if (firstLegendary && firstLegendary.type === 'character') {
      setLegendaryChar(firstLegendary.character);
      playLegendaryReveal();
    } else {
      setLegendaryChar(null);
    }
    setShowOverlay(true);
  }

  function dismissLegendary() {
    setLegendaryChar(null);
    setLegendaryDone(true);
  }

  function closeOverlay() {
    setShowOverlay(false);
    setPullResults([]);
    setRevealedCount(0);
    setLegendaryChar(null);
    setLegendaryDone(false);
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
    <div
      className="relative h-screen w-screen flex flex-col overflow-hidden text-slate-100"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <PageHeader title="Contract" onBack={onBack} />

      {/* ── Fullscreen banner track ── */}
      <div className="relative flex-1 overflow-hidden">
      <div
        className="absolute inset-0 flex transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: `${BANNER_CONFIGS.length * 100}%`,
          transform: `translateX(-${bannerIdx * (100 / BANNER_CONFIGS.length)}%)`,
        }}
      >
        {BANNER_CONFIGS.map((b) => (
          <BannerPanel key={b.id} banner={b} />
        ))}
      </div>

      {/* Prev / Next arrows — big and noticeable */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-black/50 text-3xl font-bold text-white/70 backdrop-blur-sm transition hover:scale-110 hover:border-white/40 hover:bg-black/70 hover:text-white"
      >
        ‹
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-black/50 text-3xl font-bold text-white/70 backdrop-blur-sm transition hover:scale-110 hover:border-white/40 hover:bg-black/70 hover:text-white"
      >
        ›
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-[140px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        {BANNER_CONFIGS.map((b, i) => (
          <button
            key={b.id}
            onClick={() => setBannerIdx(i)}
            className={`rounded-full transition-all duration-300 ${
              i === bannerIdx ? 'h-2.5 w-8 bg-white/80' : 'h-2.5 w-2.5 bg-white/25 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      </div>
      {/* Bottom pull controls — overlaid on banner */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-6 pb-5 pt-12">
        <div className="mb-1 text-center text-[11px] text-white/40">{banner.ratesText}</div>
        <div className="mb-3 text-center text-[10px] text-white/25">
          Pity: {pity}/{PITY_THRESHOLD} · Guaranteed {RARITY_SYM.Legendary} at {PITY_THRESHOLD}
        </div>
        <div className="flex justify-center gap-3">
          <button
            disabled={!canAfford1}
            onClick={() => doPull(1)}
            className={`flex w-40 flex-col items-center rounded-xl border py-3.5 text-sm font-bold backdrop-blur-sm transition ${
              canAfford1
                ? 'border-white/20 bg-white/10 text-white/90 hover:bg-white/[0.18]'
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
            className={`flex w-40 flex-col items-center rounded-xl border py-3.5 text-sm font-bold backdrop-blur-sm transition ${
              canAfford10
                ? 'border-yellow-500/40 bg-yellow-950/60 text-yellow-200 hover:bg-yellow-900/60'
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

      {/* ── Legendary splash ── */}
      {showOverlay && legendaryChar && !legendaryDone && (
        <LegendarySplash char={legendaryChar} onDismiss={dismissLegendary} />
      )}

      {/* ── Pull overlay (after legendary splash if any) ── */}
      {showOverlay && (!legendaryChar || legendaryDone) && (
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

/* ── Banner panel (fullscreen) ── */

function BannerPanel({ banner }: { banner: BannerConfig }) {
  const featuredChars = banner.featuredIds
    .map((id) => CHARACTER_POOL.find((c) => c.id === id))
    .filter((c): c is Character => Boolean(c));

  return (
    <div
      className="relative flex h-full flex-col items-center justify-center"
      style={{ width: `${100 / BANNER_CONFIGS.length}%`, background: banner.bgGradient }}
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${banner.glowColor} 0%, transparent 60%)`,
        }}
      />

      {/* Decorative watermark — large, centered */}
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-black leading-none opacity-[0.03] ${banner.accentColor}`}
        style={{ fontSize: '280px' }}
      >
        {banner.decorSymbol}
      </div>

      <div className="relative z-[5] flex flex-col items-center gap-5 text-center">
        {/* Tag chip */}
        <div className={`rounded-full px-4 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-white/90 ${banner.tagBg}`}>
          {banner.tag}
        </div>

        {/* Banner name */}
        <div>
          <h2
            style={{ fontFamily: "'Cinzel Decorative', Georgia, serif" }}
            className={`text-2xl font-black leading-snug sm:text-4xl ${banner.titleColor}`}
          >
            {banner.name}
          </h2>
          <div className={`mt-2 text-xs font-semibold uppercase tracking-[0.35em] opacity-60 ${banner.accentColor}`}>
            {banner.subtitle}
          </div>
        </div>

        {/* Featured portraits */}
        {featuredChars.length > 0 && (
          <div className="flex items-start gap-4">
            <div className="flex gap-3">
              {featuredChars.slice(0, 4).map((c) => {
                const s = RARITY_CARD[c.rarity];
                return (
                  <div key={c.id} className="flex flex-col items-center gap-1.5">
                    <div className={`h-16 w-16 overflow-hidden rounded-xl border-2 bg-slate-800/80 ${s.border}`}>
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="h-full w-full object-cover object-top"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-400">
                          {c.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className={`text-[10px] font-bold ${s.text}`}>{RARITY_SYM[c.rarity]}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-left">
              <div className="text-[11px] font-black uppercase tracking-wider text-white/50">Featured</div>
              <div className="text-[10px] text-white/35">50% rate-up</div>
              <div className="text-[10px] italic text-white/20">when matching rarity</div>
            </div>
          </div>
        )}

        {/* Currency pill */}
        <div className={`rounded-full border border-current/20 px-5 py-1.5 text-sm font-semibold ${banner.accentColor}`}>
          {banner.currencyIcon} {banner.currencyLabel} · {banner.costPer} per pull
        </div>

        <div className="text-[10px] text-white/20 italic">
          Pulls may contain equipment items
        </div>
      </div>
    </div>
  );
}

/* ── Legendary splash screen ── */

function LegendarySplash({ char, onDismiss }: { char: Character; onDismiss: () => void }) {
  const [phase, setPhase] = useState<'flash' | 'reveal' | 'ready'>('flash');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 600);
    const t2 = setTimeout(() => setPhase('ready'), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
      onClick={phase === 'ready' ? onDismiss : undefined}
      style={{ cursor: phase === 'ready' ? 'pointer' : 'default' }}
    >
      {/* Black base */}
      <div className="absolute inset-0 bg-black" />

      {/* White flash */}
      {phase === 'flash' && (
        <div className="absolute inset-0 legendary-flash bg-yellow-200" />
      )}

      {/* Rotating rays */}
      {phase !== 'flash' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="legendary-rays" style={{ width: '200vmax', height: '200vmax' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 origin-center"
                style={{
                  width: '4px',
                  height: '120vmax',
                  background: 'linear-gradient(to bottom, rgba(251,191,36,0.08), transparent)',
                  transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                  transformOrigin: 'bottom center',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Character art — fullscreen */}
      {phase !== 'flash' && (
        <div className="absolute inset-0 legendary-zoom">
          {char.image ? (
            <img
              src={char.image}
              alt={char.name}
              className="h-full w-full object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="select-none font-black text-yellow-500/20" style={{ fontSize: '30vw' }}>
                {char.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Gradient overlay for text readability */}
      {phase !== 'flash' && (
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/70 to-transparent" />
      )}

      {/* Name + rarity */}
      {phase !== 'flash' && (
        <div className="absolute inset-x-0 bottom-0 z-10 pb-16 text-center legendary-text">
          <div className="text-xs font-black uppercase tracking-[0.5em] text-yellow-400/60 mb-2">
            ✸ Legendary ✸
          </div>
          <h2
            style={{ fontFamily: "'Cinzel Decorative', Georgia, serif" }}
            className="text-4xl font-black text-white sm:text-5xl"
          >
            {char.name}
          </h2>
          {phase === 'ready' && (
            <div className="mt-4 text-sm text-white/40 animate-pulse">
              Tap to continue
            </div>
          )}
        </div>
      )}

      {/* Gold particles */}
      {phase !== 'flash' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="epic-particle absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${40 + Math.random() * 60}%`,
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                background: `hsl(${40 + Math.random() * 20}, 100%, ${60 + Math.random() * 30}%)`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Pull overlay ── */

function PullOverlay({
  results,
  revealedCount,
  onSkip,
  onClose,
}: {
  results: PullResult[];
  revealedCount: number;
  onSkip: () => void;
  onClose: () => void;
}) {
  const allRevealed = revealedCount >= results.length;
  const isSingle = results.length === 1;
  const hasEpicPlus = results.some((r) => {
    const rarity = r.type === 'character' ? r.character.rarity : r.item.rarity;
    return rarity === 'Epic' || rarity === 'Legendary';
  });

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm ${hasEpicPlus ? 'bg-black/80' : 'bg-black/90'}`}>
      {hasEpicPlus && <EpicParticles />}

      <div className="relative z-10 w-full max-w-7xl px-4 overflow-y-auto max-h-[90vh]">
        {isSingle ? (
          <div className="mb-8 flex justify-center">
            {results.length > 0 && <ResultCardLarge result={results[0]} revealed={revealedCount >= 1} />}
          </div>
        ) : (
          <div className="mb-6 grid grid-cols-5 gap-4">
            {results.map((result, i) => (
              <ResultCard key={i} result={result} revealed={i < revealedCount} />
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

function EpicParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="epic-particle absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#a78bfa' : '#f472b6',
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full epic-glow"
        style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)' }}
      />
    </div>
  );
}

/* ── Result cards ── */

function ResultCardLarge({ result, revealed }: { result: PullResult; revealed: boolean }) {
  if (result.type === 'character') {
    const char = result.character;
    const s = RARITY_CARD[char.rarity];
    const isLegendary = char.rarity === 'Legendary';
    const isEpicPlus = char.rarity === 'Epic' || isLegendary;
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border-2 bg-gradient-to-b shadow-lg transition-all duration-700 ${s.border} ${s.from} ${s.to} ${s.glow ? `shadow-xl ${s.glow}` : ''} mx-auto h-[28rem] w-[18rem] ${
          revealed ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-6 opacity-0'
        } ${isLegendary && revealed ? 'legendary-card-glow' : isEpicPlus && revealed ? 'epic-card-glow' : ''}`}
      >
        <div className="absolute inset-0">
          {char.image ? (
            <img src={char.image} alt={char.name} className="h-full w-full object-cover object-top"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-black text-white/10" style={{ fontSize: '8rem' }}>
              {char.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-14">
          <div className="text-center text-xl font-bold text-white">{char.name}</div>
          <div className={`text-center text-base ${s.text}`}>{RARITY_SYM[char.rarity]} {char.rarity}</div>
        </div>
      </div>
    );
  }
  const item = result.item;
  const s = RARITY_CARD[item.rarity];
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 bg-gradient-to-b shadow-lg transition-all duration-700 ${s.border} ${s.from} ${s.to} ${s.glow ? `shadow-xl ${s.glow}` : ''} mx-auto flex h-[28rem] w-[18rem] flex-col items-center justify-center ${
        revealed ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-6 opacity-0'
      }`}
    >
      <div className="text-7xl mb-4">{SLOT_EMOJI[item.slot]}</div>
      <div className="text-xl font-bold text-white text-center px-3">{item.name}</div>
      <div className={`text-base ${s.text} mt-1`}>{RARITY_SYM[item.rarity]} {item.rarity}</div>
      <div className="mt-4 rounded-lg bg-black/40 px-4 py-2 text-sm text-white/70">
        {STAT_LABELS[item.mainStat.stat]} +{item.mainStat.value}
      </div>
    </div>
  );
}

function ResultCard({ result, revealed }: { result: PullResult; revealed: boolean }) {
  if (result.type === 'character') {
    const char = result.character;
    const s = RARITY_CARD[char.rarity];
    const isLegendary = char.rarity === 'Legendary';
    const isEpicPlus = char.rarity === 'Epic' || isLegendary;
    return (
      <div
        className={`relative overflow-hidden rounded-xl border-2 bg-gradient-to-b shadow-lg transition-all duration-500 ${s.border} ${s.from} ${s.to} ${s.glow ? `shadow-lg ${s.glow}` : ''} h-56 w-full ${
          revealed ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-3 opacity-0'
        } ${isLegendary && revealed ? 'legendary-card-glow' : isEpicPlus && revealed ? 'epic-card-glow' : ''}`}
      >
        <div className="absolute inset-0">
          {char.image ? (
            <img src={char.image} alt={char.name} className="h-full w-full object-cover object-top"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-black text-white/10" style={{ fontSize: '4rem' }}>
              {char.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 pb-2 pt-8">
          <div className="truncate text-center text-sm font-bold leading-tight text-white">
            {char.name.split(' ')[0]}
          </div>
          <div className={`text-center text-xs ${s.text}`}>
            {RARITY_SYM[char.rarity]} {char.rarity}
          </div>
        </div>
      </div>
    );
  }

  const item = result.item;
  const s = RARITY_CARD[item.rarity];
  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 bg-gradient-to-b shadow-lg transition-all duration-500 ${s.border} ${s.from} ${s.to} ${s.glow ? `shadow-lg ${s.glow}` : ''} flex h-56 w-full flex-col items-center justify-center ${
        revealed ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-3 opacity-0'
      }`}
    >
      <div className="text-4xl mb-2">{SLOT_EMOJI[item.slot]}</div>
      <div className="truncate text-center text-sm font-bold text-white px-2 w-full">{item.name}</div>
      <div className={`text-center text-xs ${s.text} mt-0.5`}>{RARITY_SYM[item.rarity]} {item.rarity}</div>
      <div className="mt-2 text-xs text-white/50">{STAT_LABELS[item.mainStat.stat]} +{item.mainStat.value}</div>
    </div>
  );
}
