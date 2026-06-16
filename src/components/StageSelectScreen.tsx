import { useGameStore } from '../store/gameStore';
import { STAGES } from '../data/stages';

interface Props {
  onBack: () => void;
  onEnterStage: (stageId: string) => void;
}

export default function StageSelectScreen({ onBack, onEnterStage }: Props) {
  const unlockedStageIds = useGameStore((s) => s.unlockedStageIds);
  const activeTeamIds = useGameStore((s) => s.activeTeamIds);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <button className="btn-secondary self-start" onClick={onBack}>
        ← Back
      </button>
      <h2 className="text-2xl font-bold">Stages</h2>
      {activeTeamIds.length < 3 && (
        <div className="text-sm text-yellow-300">Build a full 3-character team in the Roster before battling.</div>
      )}
      <div className="flex w-full max-w-md flex-col gap-3">
        {STAGES.map((stage) => {
          const unlocked = unlockedStageIds.includes(stage.id);
          return (
            <button
              key={stage.id}
              disabled={!unlocked || activeTeamIds.length < 3}
              onClick={() => onEnterStage(stage.id)}
              className="btn flex justify-between"
            >
              <span>{unlocked ? stage.name : '??? (Locked)'}</span>
              <span>💎 {stage.goldReward}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
