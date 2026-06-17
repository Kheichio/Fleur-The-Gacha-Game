import { useGameStore } from '../store/gameStore';

type NavScreen = 'contract' | 'party' | 'travel';

interface Props {
  onNavigate: (screen: NavScreen) => void;
}

export default function Hub({ onNavigate }: Props) {
  const coins = useGameStore((s) => s.coins);
  const rubies = useGameStore((s) => s.rubies);

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-slate-950 p-6">
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
      </div>

      {/* Title */}
      <div className="title-float mt-20 mb-16 flex flex-col items-center select-none">
        <div className="text-[10px] font-semibold tracking-[0.5em] text-slate-500 uppercase mb-2">
          ✦ &nbsp; ✦ &nbsp; ✦
        </div>
        <h1 className="title-main text-6xl sm:text-7xl font-black tracking-widest leading-none">
          FLEUR
        </h1>
        <div className="title-sub mt-2 text-base sm:text-xl font-semibold tracking-[0.3em] uppercase">
          The Gacha Game
        </div>
        <div className="mt-3 text-[10px] font-semibold tracking-[0.5em] text-slate-600 uppercase">
          ✦ &nbsp; ✦ &nbsp; ✦
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <button
          onClick={() => onNavigate('contract')}
          className="group flex flex-1 flex-col items-center gap-2 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-900/50 to-slate-900/80 px-5 py-6 shadow-lg transition duration-200 hover:scale-105 hover:border-purple-400/60 hover:from-purple-800/60"
        >
          <span className="text-4xl transition-transform duration-200 group-hover:scale-110">📜</span>
          <span className="text-base font-bold text-purple-200">Contract</span>
          <span className="text-[11px] font-normal text-purple-400/70">Summon allies</span>
        </button>

        <button
          onClick={() => onNavigate('party')}
          className="group flex flex-1 flex-col items-center gap-2 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-900/50 to-slate-900/80 px-5 py-6 shadow-lg transition duration-200 hover:scale-105 hover:border-emerald-400/60 hover:from-emerald-800/60"
        >
          <span className="text-4xl transition-transform duration-200 group-hover:scale-110">⚔️</span>
          <span className="text-base font-bold text-emerald-200">Party</span>
          <span className="text-[11px] font-normal text-emerald-400/70">Manage your team</span>
        </button>

        <button
          onClick={() => onNavigate('travel')}
          className="group flex flex-1 flex-col items-center gap-2 rounded-2xl border border-amber-600/30 bg-gradient-to-b from-amber-900/50 to-slate-900/80 px-5 py-6 shadow-lg transition duration-200 hover:scale-105 hover:border-amber-500/60 hover:from-amber-800/60"
        >
          <span className="text-4xl transition-transform duration-200 group-hover:scale-110">🗺️</span>
          <span className="text-base font-bold text-amber-200">Travel</span>
          <span className="text-[11px] font-normal text-amber-400/70">Explore the world</span>
        </button>
      </div>
    </div>
  );
}
