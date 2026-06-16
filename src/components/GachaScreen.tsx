import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PULL_COST } from '../systems/gacha';
import CharacterCard from './CharacterCard';

interface Props {
  onBack: () => void;
}

export default function GachaScreen({ onBack }: Props) {
  const gems = useGameStore((s) => s.gems);
  const pull = useGameStore((s) => s.pull);
  const lastPullResults = useGameStore((s) => s.lastPullResults);
  const [error, setError] = useState<string | null>(null);

  function handlePull(count: number) {
    if (gems < PULL_COST * count) {
      setError(`Not enough gems (need ${PULL_COST * count}).`);
      return;
    }
    setError(null);
    pull(count);
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <button className="btn-secondary self-start" onClick={onBack}>
        ← Back
      </button>
      <h2 className="text-2xl font-bold">Gacha Banner</h2>
      <div>
        💎 {gems} Gems — {PULL_COST} per pull
      </div>
      <div className="flex gap-4">
        <button className="btn" onClick={() => handlePull(1)}>
          Pull x1
        </button>
        <button className="btn" onClick={() => handlePull(10)}>
          Pull x10
        </button>
      </div>
      {error && <div className="text-red-400">{error}</div>}
      {lastPullResults.length > 0 && (
        <div className="flex max-w-3xl flex-wrap justify-center gap-3">
          {lastPullResults.map((c, i) => (
            <CharacterCard key={`${c.id}-${i}`} character={c} />
          ))}
        </div>
      )}
    </div>
  );
}
