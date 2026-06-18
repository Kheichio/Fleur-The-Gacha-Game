import { useGameStore } from '../store/gameStore';
import { DAILY_REWARDS } from '../data/dailyRewards';
import PageHeader from './PageHeader';

interface Props {
  onBack: () => void;
}

export default function DailyLoginScreen({ onBack }: Props) {
  const loginStreak = useGameStore((s) => s.loginStreak) ?? 0;
  const claimedDays = useGameStore((s) => s.claimedLoginDays) ?? [];
  const lastLoginDate = useGameStore((s) => s.lastLoginDate) ?? '';
  const claimDailyReward = useGameStore((s) => s.claimDailyReward);

  const today = new Date().toISOString().slice(0, 10);
  const isNewDay = lastLoginDate !== today;
  const currentDay = isNewDay ? loginStreak + 1 : loginStreak;

  function handleClaim(day: number) {
    const reward = DAILY_REWARDS.find((r) => r.day === day);
    if (!reward || claimedDays.includes(day)) return;
    if (day > currentDay) return;

    claimDailyReward(day, reward.type, reward.amount);

    if (isNewDay) {
      useGameStore.setState({
        lastLoginDate: today,
        loginStreak: currentDay,
      });
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#070d1a] text-slate-100">
      <PageHeader title="Daily Rewards" onBack={onBack} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Streak info */}
          <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Login Streak</div>
              <div className="text-3xl font-black text-white">{currentDay}</div>
              <div className="text-xs text-slate-500">day{currentDay !== 1 ? 's' : ''}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Next Reward</div>
              {currentDay <= 30 ? (
                <>
                  <div className="text-xl">{DAILY_REWARDS[currentDay - 1]?.icon ?? '🎁'}</div>
                  <div className="text-xs text-slate-400">{DAILY_REWARDS[currentDay - 1]?.label ?? 'Day ' + currentDay}</div>
                </>
              ) : (
                <div className="text-sm text-yellow-400">All claimed!</div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="mb-1.5 flex justify-between text-[10px] text-slate-600">
              <span>{claimedDays.length}/{DAILY_REWARDS.length} claimed</span>
              <span>Day {currentDay}/30</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all"
                style={{ width: `${(claimedDays.length / DAILY_REWARDS.length) * 100}%` }} />
            </div>
          </div>

          {/* Reward grid */}
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-10">
            {DAILY_REWARDS.map((reward) => {
              const claimed = claimedDays.includes(reward.day);
              const available = reward.day <= currentDay && !claimed;
              const locked = reward.day > currentDay;

              return (
                <button
                  key={reward.day}
                  disabled={!available}
                  onClick={() => handleClaim(reward.day)}
                  className={`relative flex flex-col items-center gap-1 rounded-xl border p-3 transition ${
                    claimed
                      ? 'border-green-800/40 bg-green-950/20 opacity-50'
                      : available
                      ? 'border-yellow-600/50 bg-yellow-950/30 hover:scale-105 hover:bg-yellow-900/40'
                      : reward.special
                      ? 'border-violet-700/30 bg-violet-950/20 opacity-60'
                      : 'border-slate-800/30 bg-slate-900/20 opacity-40'
                  }`}
                >
                  <div className="text-[9px] font-bold text-slate-600">Day {reward.day}</div>
                  <div className={`text-xl ${claimed ? 'grayscale' : ''}`}>{reward.icon}</div>
                  <div className="text-[8px] text-slate-400 text-center leading-tight">{reward.label}</div>
                  {claimed && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-green-950/40">
                      <span className="text-lg text-green-400">✓</span>
                    </div>
                  )}
                  {reward.special && !claimed && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-violet-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-center text-[10px] text-slate-700">
            Log in each day to claim rewards. Special tickets on days 7, 14, and 30!
          </p>
        </div>
      </div>
    </div>
  );
}
