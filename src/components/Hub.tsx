import { useGameStore } from '../store/gameStore';

type Screen = 'gacha' | 'roster' | 'stages';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export default function Hub({ onNavigate }: Props) {
  const gems = useGameStore((s) => s.gems);

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <h1 className="text-4xl font-bold text-pink-300">Fleur</h1>
      <div className="text-lg">💎 {gems} Gems</div>
      <div className="flex gap-4">
        <button className="btn" onClick={() => onNavigate('gacha')}>
          Gacha
        </button>
        <button className="btn" onClick={() => onNavigate('roster')}>
          Roster
        </button>
        <button className="btn" onClick={() => onNavigate('stages')}>
          Stages
        </button>
      </div>
    </div>
  );
}
