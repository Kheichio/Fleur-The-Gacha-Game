import { useGameStore } from '../store/gameStore';

type NavScreen = 'contract' | 'party' | 'travel' | 'characters' | 'luggage' | 'account' | 'quests';


interface Props {
  onNavigate: (screen: NavScreen) => void;
}

export default function Hub({ onNavigate }: Props) {
  const coins = useGameStore((s) => s.coins);
  const rubies = useGameStore((s) => s.rubies);
  const shards = useGameStore((s) => s.shards) ?? 0;
  const addCoins = useGameStore((s) => s.addCoins);
  const addRubies = useGameStore((s) => s.addRubies);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center p-6"
      style={{
        background: 'linear-gradient(160deg, #0a0a1a 0%, #0d1117 30%, #12081f 60%, #0a0e1a 100%)',
      }}
    >
      {/* Account — top left, large and noticeable */}
      <button
        onClick={() => onNavigate('account')}
        className="absolute left-4 top-4 z-10 flex items-center gap-3 rounded-2xl border-2 border-yellow-600/40 bg-slate-900/90 px-5 py-3 shadow-xl transition duration-200 hover:scale-105 hover:border-yellow-400/60 hover:bg-slate-800/90"
      >
        <span className="text-3xl">👤</span>
        <div className="flex flex-col items-start">
          <span className="text-sm font-bold text-slate-200">Account</span>
          <span className="text-[10px] text-slate-500">Profile &amp; Stats</span>
        </div>
      </button>

      {/* Currency — top right */}
      <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5 z-10">
        <div className="flex items-center gap-2 rounded-full border border-yellow-600/40 bg-slate-900/90 px-3.5 py-1.5 shadow-lg">
          <span className="text-base">🪙</span>
          <span className="text-sm font-bold text-yellow-300">{coins.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-red-500/40 bg-slate-900/90 px-3.5 py-1.5 shadow-lg">
          <span className="text-base">💎</span>
          <span className="text-sm font-bold text-red-300">{rubies}</span>
        </div>
        {shards > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-900/90 px-3.5 py-1.5 shadow-lg">
            <span className="text-base">🔷</span>
            <span className="text-sm font-bold text-cyan-300">{shards.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="title-float mt-20 mb-12 flex flex-col items-center select-none">
        <div className="text-[10px] font-semibold tracking-[0.5em] text-slate-500 uppercase mb-2">
          ✦ &nbsp; ✦ &nbsp; ✦
        </div>
        <h1 className="title-main text-5xl sm:text-6xl font-black tracking-widest leading-none text-center">
          FLEUR'S DESOLATION
        </h1>
        <div className="title-sub mt-2 text-base sm:text-xl font-semibold tracking-[0.3em] uppercase">
          The Gacha Game
        </div>
        <div className="mt-3 text-[10px] font-semibold tracking-[0.5em] text-slate-600 uppercase">
          ✦ &nbsp; ✦ &nbsp; ✦
        </div>
      </div>

      {/* Nav buttons — 2×2 grid + luggage below */}
      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('contract')}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-900/50 to-slate-900/80 px-5 py-6 shadow-lg transition duration-200 hover:scale-105 hover:border-purple-400/60 hover:from-purple-800/60"
        >
          <span className="text-4xl transition-transform duration-200 group-hover:scale-110">📜</span>
          <span className="text-base font-bold text-purple-200">Contract</span>
          <span className="text-[11px] font-normal text-purple-400/70">Summon allies</span>
        </button>

        <button
          onClick={() => onNavigate('characters')}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-900/50 to-slate-900/80 px-5 py-6 shadow-lg transition duration-200 hover:scale-105 hover:border-cyan-400/60 hover:from-cyan-800/60"
        >
          <span className="text-4xl transition-transform duration-200 group-hover:scale-110">✦</span>
          <span className="text-base font-bold text-cyan-200">Characters</span>
          <span className="text-[11px] font-normal text-cyan-400/70">Upgrade &amp; manage</span>
        </button>

        <button
          onClick={() => onNavigate('party')}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-900/50 to-slate-900/80 px-5 py-6 shadow-lg transition duration-200 hover:scale-105 hover:border-emerald-400/60 hover:from-emerald-800/60"
        >
          <span className="text-4xl transition-transform duration-200 group-hover:scale-110">⚔️</span>
          <span className="text-base font-bold text-emerald-200">Party</span>
          <span className="text-[11px] font-normal text-emerald-400/70">Compose your team</span>
        </button>

        <button
          onClick={() => onNavigate('travel')}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-amber-600/30 bg-gradient-to-b from-amber-900/50 to-slate-900/80 px-5 py-6 shadow-lg transition duration-200 hover:scale-105 hover:border-amber-500/60 hover:from-amber-800/60"
        >
          <span className="text-4xl transition-transform duration-200 group-hover:scale-110">🗺️</span>
          <span className="text-base font-bold text-amber-200">Travel</span>
          <span className="text-[11px] font-normal text-amber-400/70">Explore the world</span>
        </button>
      </div>

      {/* Bottom row — Luggage + Quests */}
      <div className="mt-3 grid w-full max-w-sm grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('luggage')}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-900/50 to-slate-900/80 px-5 py-5 shadow-lg transition duration-200 hover:scale-105 hover:border-orange-400/60 hover:from-orange-800/60"
        >
          <span className="text-4xl transition-transform duration-200 group-hover:scale-110">🧳</span>
          <span className="text-base font-bold text-orange-200">Luggage</span>
          <span className="text-[11px] font-normal text-orange-400/70">Items &amp; equipment</span>
        </button>
        <button
          onClick={() => onNavigate('quests')}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-900/50 to-slate-900/80 px-5 py-5 shadow-lg transition duration-200 hover:scale-105 hover:border-violet-400/60 hover:from-violet-800/60"
        >
          <span className="text-4xl transition-transform duration-200 group-hover:scale-110">📋</span>
          <span className="text-base font-bold text-violet-200">Quests</span>
          <span className="text-[11px] font-normal text-violet-400/70">Earn rubies</span>
        </button>
      </div>

      {/* Version */}
      <div className="absolute bottom-3 right-4 z-10 text-[10px] font-mono text-slate-700/50">
        Alpha Version 0.1.2a
      </div>

      {/* Secret dev buttons — barely visible, hover to reveal */}
      <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-[0.12] hover:opacity-50 transition-opacity duration-300 z-20">
        <button
          onClick={() => addCoins(10000)}
          className="rounded border border-yellow-800/60 bg-slate-950 px-2 py-1 text-[9px] font-mono text-yellow-600"
        >
          +🪙
        </button>
        <button
          onClick={() => addRubies(100)}
          className="rounded border border-red-900/60 bg-slate-950 px-2 py-1 text-[9px] font-mono text-red-600"
        >
          +💎
        </button>
      </div>
    </div>
  );
}
