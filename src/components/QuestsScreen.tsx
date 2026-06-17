import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import { QUESTS, type QuestCheckData } from '../data/quests';
import CurrencyBar from './CurrencyBar';

interface Props {
  onBack: () => void;
}

export default function QuestsScreen({ onBack }: Props) {
  const playerStats = useGameStore((s) => s.playerStats) ?? { totalPulls: 0, coinsSpent: 0, rubiesSpent: 0, monstersDefeated: 0, teammatesPerished: 0, itemsObtained: 0 };
  const ownedCounts = useGameStore((s) => s.ownedCounts);
  const characterData = useGameStore((s) => s.characterData);
  const inventory = useGameStore((s) => s.inventory) ?? [];
  const equipped = useGameStore((s) => s.equipped) ?? {};
  const unlockedStageIds = useGameStore((s) => s.unlockedStageIds);
  const claimedQuests = useGameStore((s) => s.claimedQuests) ?? [];
  const claimQuest = useGameStore((s) => s.claimQuest);

  const charactersOwned = CHARACTER_POOL.filter((c) => ownedCounts[c.id] > 0).length;
  const totalLevel = Object.values(characterData).reduce((sum, d) => sum + (d?.level ?? 1), 0);
  const enhancedAny = Object.values(characterData).some((d) => (d?.enhancement ?? 0) > 0);
  const equippedAny = Object.values(equipped).some((slots) => slots?.weapon || slots?.armor || slots?.accessory);

  const checkData: QuestCheckData = {
    totalPulls: playerStats.totalPulls,
    monstersDefeated: playerStats.monstersDefeated,
    charactersOwned,
    itemsOwned: inventory.length,
    stagesCleared: Math.max(0, unlockedStageIds.length - 1),
    totalLevel,
    enhancedAny,
    equippedAny,
  };

  const completedCount = QUESTS.filter((q) => q.check(checkData)).length;
  const claimedCount = claimedQuests.length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#070d1a] text-slate-100">
      {/* Left sidebar */}
      <aside className="flex w-56 flex-col border-r border-slate-800/60 bg-slate-950/60">
        <div className="border-b border-slate-800/60 p-4">
          <h2 style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-lg font-bold text-slate-100">
            Quests
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-600">Missions & Rewards</p>
        </div>

        <div className="border-b border-slate-800/60 px-4 py-2">
          <CurrencyBar />
        </div>

        <div className="flex-1 p-4">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 text-center">
            <div className="text-3xl font-black text-white">{claimedCount}</div>
            <div className="text-[10px] text-slate-500">of {QUESTS.length} claimed</div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all"
                style={{ width: `${(claimedCount / QUESTS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/60 p-3">
          <button
            onClick={onBack}
            className="w-full rounded-xl border border-slate-800 py-2 text-xs font-semibold text-slate-600 transition hover:text-slate-400"
          >
            ← Back to Hub
          </button>
        </div>
      </aside>

      {/* Quest list */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 text-xs text-slate-500">
          {completedCount} completed · {claimedCount} claimed · {QUESTS.length - completedCount} remaining
        </div>

        <div className="flex flex-col gap-2">
          {QUESTS.map((quest) => {
            const done = quest.check(checkData);
            const claimed = claimedQuests.includes(quest.id);
            return (
              <div
                key={quest.id}
                className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                  claimed
                    ? 'border-slate-800/30 bg-slate-900/20 opacity-50'
                    : done
                      ? 'border-violet-600/40 bg-violet-950/20'
                      : 'border-slate-800/40 bg-slate-900/30'
                }`}
              >
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl ${done ? 'bg-violet-950/50' : 'bg-slate-800/40'}`}>
                  {quest.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${claimed ? 'text-slate-600 line-through' : done ? 'text-white' : 'text-slate-400'}`}>
                    {quest.name}
                  </div>
                  <div className="text-[11px] text-slate-500">{quest.description}</div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1 text-sm font-bold text-red-300">
                    <span>💎</span>
                    <span>{quest.reward}</span>
                  </div>
                  {claimed ? (
                    <span className="text-[10px] font-bold text-slate-600">Claimed</span>
                  ) : done ? (
                    <button
                      onClick={() => claimQuest(quest.id, quest.reward)}
                      className="rounded-lg border border-violet-600/50 bg-violet-950/50 px-3 py-1 text-[10px] font-bold text-violet-300 transition hover:bg-violet-900/60"
                    >
                      Claim
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-700">In progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
