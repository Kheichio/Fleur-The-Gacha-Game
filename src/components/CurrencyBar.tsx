import { useGameStore } from '../store/gameStore';

export default function CurrencyBar() {
  const coins = useGameStore((s) => s.coins);
  const rubies = useGameStore((s) => s.rubies);
  const shards = useGameStore((s) => s.shards) ?? 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-full border border-yellow-600/40 bg-slate-900/90 px-3 py-1 shadow">
        <span className="text-sm">🪙</span>
        <span className="text-sm font-bold text-yellow-300">{coins.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-slate-900/90 px-3 py-1 shadow">
        <span className="text-sm">💎</span>
        <span className="text-sm font-bold text-red-300">{rubies}</span>
      </div>
      {shards > 0 && (
        <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-slate-900/90 px-3 py-1 shadow">
          <span className="text-sm">🔷</span>
          <span className="text-sm font-bold text-cyan-300">{shards.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
