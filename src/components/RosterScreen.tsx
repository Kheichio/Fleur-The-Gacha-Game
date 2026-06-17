import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import CharacterCard from './CharacterCard';

interface Props {
  onBack: () => void;
}

export default function RosterScreen({ onBack }: Props) {
  const ownedCounts = useGameStore((s) => s.ownedCounts);
  const activeTeamIds = useGameStore((s) => s.activeTeamIds);
  const setTeam = useGameStore((s) => s.setTeam);

  const owned = CHARACTER_POOL.filter((c) => ownedCounts[c.id] > 0);

  function toggle(id: string) {
    if (activeTeamIds.includes(id)) {
      setTeam(activeTeamIds.filter((t) => t !== id));
    } else if (activeTeamIds.length < 3) {
      setTeam([...activeTeamIds, id]);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <button className="btn-secondary self-start" onClick={onBack}>
        ← Back
      </button>
      <h2 className="text-2xl font-bold">Party</h2>
      <div className="text-sm opacity-80">
        Pick up to 3 characters for your active party ({activeTeamIds.length}/3)
      </div>
      {owned.length === 0 ? (
        <div className="opacity-70">No characters yet — try the Contract!</div>
      ) : (
        <div className="flex max-w-3xl flex-wrap justify-center gap-3">
          {owned.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              count={ownedCounts[c.id]}
              selected={activeTeamIds.includes(c.id)}
              onClick={() => toggle(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
