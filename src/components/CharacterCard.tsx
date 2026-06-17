import type { Character } from '../types';
import { RARITY_COLORS } from '../data/characters';

interface Props {
  character: Character;
  selected?: boolean;
  onClick?: () => void;
  count?: number;
}

export default function CharacterCard({ character, selected, onClick, count }: Props) {
  const interactive = Boolean(onClick);
  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      className={`flex flex-col items-center gap-1 rounded-lg border-2 bg-slate-800/60 p-3 transition ${
        RARITY_COLORS[character.rarity]
      } ${selected ? 'ring-2 ring-white' : ''} ${interactive ? 'cursor-pointer hover:scale-105' : ''}`}
    >
      {character.image ? (
        <img
          src={character.image}
          alt={character.name}
          className="h-14 w-14 rounded-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg';
          }}
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-700 text-2xl font-bold">
          {character.name.charAt(0)}
        </div>
      )}
      <div className="text-sm font-semibold">{character.name}</div>
      <div className="text-xs opacity-80">{character.rarity}</div>
      <div className="text-[10px] opacity-70">
        HP {character.stats.hp} / ATK {character.stats.atk}
      </div>
      {count && count > 1 && <div className="text-[10px] opacity-60">x{count}</div>}
    </div>
  );
}
