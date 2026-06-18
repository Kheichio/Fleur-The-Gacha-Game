import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateOpponents, getRankTier, RANK_TIERS, type ArenaOpponent } from '../data/arena';
import PageHeader from './PageHeader';

interface Props {
  onBack: () => void;
  onBattle: (stageId: string, area?: string) => void;
}

export default function ArenaScreen({ onBack, onBattle }: Props) {
  const trophies = useGameStore((s) => s.arenaTrophies) ?? 0;
  const wins = useGameStore((s) => s.arenaWins) ?? 0;
  const losses = useGameStore((s) => s.arenaLosses) ?? 0;
  const activeTeamIds = useGameStore((s) => s.activeTeamIds);
  const recordArenaResult = useGameStore((s) => s.recordArenaResult);

  const [opponents, setOpponents] = useState<ArenaOpponent[]>(() => generateOpponents(trophies));
  const [selectedOpp, setSelectedOpp] = useState<ArenaOpponent | null>(null);
  const [battleResult, setBattleResult] = useState<'win' | 'loss' | null>(null);

  const rank = useMemo(() => getRankTier(trophies), [trophies]);
  const nextTier = RANK_TIERS.find((t) => t.minTrophies > trophies);

  function refreshOpponents() {
    setOpponents(generateOpponents(trophies));
    setSelectedOpp(null);
    setBattleResult(null);
  }

  function simulateFight(opp: ArenaOpponent) {
    setSelectedOpp(opp);
    const playerPower = activeTeamIds.length * 100 + trophies * 0.1 + Math.random() * 200;
    const oppPower = opp.trophies * 0.12 + Math.random() * 200;
    const won = playerPower > oppPower;
    recordArenaResult(won);
    setBattleResult(won ? 'win' : 'loss');
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#070d1a] text-slate-100">
      <PageHeader title="Arena" onBack={onBack} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left — rank info */}
        <aside className="flex w-64 flex-col border-r border-slate-800/60 bg-slate-950/60">
          <div className="p-5">
            {/* Rank display */}
            <div className="mb-5 flex flex-col items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
              <div className="text-4xl">{rank.icon}</div>
              <div className={`text-lg font-black ${rank.color}`}>{rank.name}</div>
              <div className="text-2xl font-black text-white">{trophies}</div>
              <div className="text-[10px] text-slate-500">trophies</div>
              {nextTier && (
                <div className="mt-1 w-full">
                  <div className="mb-1 flex justify-between text-[9px] text-slate-600">
                    <span>{rank.name}</span>
                    <span>{nextTier.name}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all"
                      style={{ width: `${Math.min(100, ((trophies - rank.minTrophies) / (nextTier.minTrophies - rank.minTrophies)) * 100)}%` }} />
                  </div>
                  <div className="mt-0.5 text-center text-[9px] text-slate-600">
                    {nextTier.minTrophies - trophies} to {nextTier.name}
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Wins</span>
                <span className="font-bold text-green-400">{wins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Losses</span>
                <span className="font-bold text-red-400">{losses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Win Rate</span>
                <span className="font-bold text-white">{wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0}%</span>
              </div>
            </div>

            <div className="h-px bg-slate-800/60 my-4" />

            {/* Season rewards */}
            <div>
              <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-600">Season Rewards</div>
              {RANK_TIERS.map((tier) => (
                <div key={tier.name} className={`flex items-center justify-between py-1 text-xs ${trophies >= tier.minTrophies ? tier.color : 'text-slate-700'}`}>
                  <span>{tier.icon} {tier.name}</span>
                  <span>💎 {tier.seasonReward}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right — opponent list */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-3">
            <span className="text-xs text-slate-500">Choose an opponent</span>
            <button
              onClick={refreshOpponents}
              className="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:text-white"
            >
              Refresh
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {activeTeamIds.length < 3 ? (
              <div className="rounded-lg border border-yellow-700/40 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-300">
                Set a full 3-character party before entering the arena.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {opponents.map((opp) => {
                  const oppRank = getRankTier(opp.trophies);
                  const isSelected = selectedOpp?.id === opp.id;
                  return (
                    <div
                      key={opp.id}
                      className={`rounded-xl border p-4 transition ${
                        isSelected
                          ? battleResult === 'win'
                            ? 'border-green-600/50 bg-green-950/30'
                            : battleResult === 'loss'
                            ? 'border-red-600/50 bg-red-950/30'
                            : 'border-yellow-600/50 bg-yellow-950/20'
                          : 'border-slate-800/50 bg-slate-900/30 hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-lg">
                            👤
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{opp.name}</div>
                            <div className={`text-[10px] font-semibold ${oppRank.color}`}>
                              {oppRank.icon} {oppRank.name} · {opp.trophies} trophies
                            </div>
                          </div>
                        </div>

                        {isSelected && battleResult ? (
                          <div className={`rounded-lg px-4 py-2 text-sm font-black ${
                            battleResult === 'win' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'
                          }`}>
                            {battleResult === 'win' ? 'Victory! +30' : 'Defeat -15'}
                          </div>
                        ) : (
                          <button
                            onClick={() => simulateFight(opp)}
                            disabled={!!battleResult}
                            className="rounded-xl border border-red-700/50 bg-red-950/50 px-5 py-2 text-sm font-bold text-red-200 transition hover:bg-red-900/60 disabled:opacity-40"
                          >
                            ⚔️ Fight
                          </button>
                        )}
                      </div>

                      {/* Team preview */}
                      <div className="flex gap-2 mt-2">
                        {opp.team.map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5 rounded-lg bg-slate-800/40 px-2 py-1">
                            <div className="h-6 w-6 overflow-hidden rounded-full border border-slate-600 bg-slate-700">
                              {c.image ? (
                                <img src={c.image} alt="" className="h-full w-full object-cover"
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[8px] font-black text-slate-400">{c.name.charAt(0)}</div>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-300">{c.name.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {battleResult && (
                  <button
                    onClick={refreshOpponents}
                    className="w-full rounded-xl border border-yellow-700/40 bg-yellow-950/30 py-3 text-sm font-bold text-yellow-300 transition hover:bg-yellow-900/40"
                  >
                    Find New Opponents
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
