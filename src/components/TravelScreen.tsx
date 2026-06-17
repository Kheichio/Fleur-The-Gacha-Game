import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface MapNode {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  type: 'town' | 'city' | 'stage' | 'wilderness' | 'ruins';
  danger: 'safe' | 'easy' | 'medium' | 'hard';
  desc: string;
  stageId?: string;
  locked?: boolean;
  connections: string[];
}

type EventState =
  | { phase: 'approach'; node: MapNode }
  | { phase: 'battle-ready'; node: MapNode; encounterId: string }
  | { phase: 'loot'; node: MapNode; coins: number; rubies: number }
  | { phase: 'rest'; node: MapNode; text: string };

const MAP_NODES: MapNode[] = [
  {
    id: 'mossgate',
    name: 'Mossgate',
    emoji: '🏘️',
    x: 8, y: 72,
    type: 'town', danger: 'safe',
    desc: 'A quiet village nestled in the hills. The innkeeper welcomes weary travelers, and the hearth fire burns all night.',
    connections: ['wilted-meadow'],
  },
  {
    id: 'wilted-meadow',
    name: 'Wilted Meadow',
    emoji: '🌿',
    x: 22, y: 55,
    type: 'stage', danger: 'easy',
    stageId: 'stage-1',
    desc: 'A sickly meadow where twisted sprouts burst from cracked earth. Something is corrupting the soil.',
    connections: ['mossgate', 'thornwood', 'bramble-hollow'],
  },
  {
    id: 'thornwood',
    name: 'Thornwood',
    emoji: '🌲',
    x: 33, y: 35,
    type: 'wilderness', danger: 'easy',
    desc: 'A dense thicket of thorned trees. Forest wolves have grown bold and territorial — travellers rarely pass uncontested.',
    connections: ['wilted-meadow', 'amber-crossroads'],
  },
  {
    id: 'bramble-hollow',
    name: 'Bramble Hollow',
    emoji: '🍂',
    x: 40, y: 72,
    type: 'stage', danger: 'medium',
    stageId: 'stage-2',
    desc: 'A dark hollow choked with thorned vines. Fiends lurk in the twisted roots, waiting for careless adventurers.',
    connections: ['wilted-meadow', 'amber-crossroads'],
  },
  {
    id: 'amber-crossroads',
    name: 'Amber Crossroads',
    emoji: '⬢',
    x: 53, y: 48,
    type: 'wilderness', danger: 'medium',
    desc: 'Where three roads meet, danger follows close behind. Bandits and wanderers alike linger here.',
    connections: ['thornwood', 'bramble-hollow', 'saltmere', 'thorned-ruins'],
  },
  {
    id: 'saltmere',
    name: 'Saltmere City',
    emoji: '🏙️',
    x: 65, y: 25,
    type: 'city', danger: 'safe',
    desc: 'A great walled city on the salt coast. Its markets bustle with merchants from across the known world.',
    locked: true,
    connections: ['amber-crossroads'],
  },
  {
    id: 'thorned-ruins',
    name: 'Thorned Ruins',
    emoji: '🏚️',
    x: 63, y: 68,
    type: 'stage', danger: 'hard',
    stageId: 'stage-3',
    desc: 'Shattered remnants of an ancient fortress, now crawling with ruin stalkers born of old sorcery.',
    connections: ['amber-crossroads', 'withering-spire', 'crumbled-bastion'],
  },
  {
    id: 'withering-spire',
    name: 'Withering Spire',
    emoji: '🗼',
    x: 76, y: 50,
    type: 'stage', danger: 'hard',
    stageId: 'stage-4',
    desc: 'A towering spire of dead stone rising from blighted earth. Wraiths circle its peak endlessly.',
    connections: ['thorned-ruins', 'sovereign-bloomguard'],
  },
  {
    id: 'crumbled-bastion',
    name: 'Crumbled Bastion',
    emoji: '🏰',
    x: 79, y: 77,
    type: 'ruins', danger: 'hard',
    desc: 'A ruined fortification used by mercenary sellswords as a base of operations. They do not welcome visitors.',
    connections: ['thorned-ruins', 'sovereign-bloomguard'],
  },
  {
    id: 'sovereign-bloomguard',
    name: "Sovereign's Gate",
    emoji: '⚔️',
    x: 91, y: 62,
    type: 'stage', danger: 'hard',
    stageId: 'stage-5',
    desc: 'The final bastion of the Bloomguard. Power beyond imagining awaits those who survive its trial.',
    connections: ['withering-spire', 'crumbled-bastion'],
  },
];

// Build unique connection pairs for SVG path lines
const CONNECTIONS: [MapNode, MapNode][] = [];
for (const node of MAP_NODES) {
  for (const connId of node.connections) {
    if (node.id < connId) {
      const other = MAP_NODES.find((n) => n.id === connId);
      if (other) CONNECTIONS.push([node, other]);
    }
  }
}

const ENCOUNTER_POOLS: Record<string, string[]> = {
  thornwood: ['enc-wolves'],
  'amber-crossroads': ['enc-bandits'],
  'crumbled-bastion': ['enc-mercenaries'],
};

const REST_TEXTS = [
  'A strange silence falls over the area. For now, the path ahead is clear.',
  'An abandoned campfire, still warm — someone passed through here not long ago.',
  'A luminous flower grows between the stones. Its petals shimmer faintly with a light you cannot explain.',
  'Nothing stirs. You take a breath and continue onward.',
];

const DANGER_LABEL: Record<string, string> = {
  safe: 'Safe', easy: 'Easy', medium: 'Moderate', hard: 'Dangerous',
};
const DANGER_COLOR: Record<string, string> = {
  safe: 'text-green-400', easy: 'text-yellow-300', medium: 'text-orange-400', hard: 'text-red-400',
};
const DANGER_DOT: Record<string, string> = {
  safe: 'bg-green-400', easy: 'bg-yellow-300', medium: 'bg-orange-400', hard: 'bg-red-400',
};

interface Props {
  onBack: () => void;
  onBattle: (id: string) => void;
}

export default function TravelScreen({ onBack, onBattle }: Props) {
  const unlockedStageIds = useGameStore((s) => s.unlockedStageIds);
  const activeTeamIds = useGameStore((s) => s.activeTeamIds);
  const addCoins = useGameStore((s) => s.addCoins);
  const addRubies = useGameStore((s) => s.addRubies);

  const [event, setEvent] = useState<EventState | null>(null);

  function isStageAccessible(node: MapNode): boolean {
    if (node.type !== 'stage' || !node.stageId) return false;
    return unlockedStageIds.includes(node.stageId);
  }

  function handleNodeClick(node: MapNode) {
    if (node.type === 'town' || node.type === 'city' || node.type === 'stage') {
      setEvent({ phase: 'approach', node });
      return;
    }
    // Wilderness / ruins — roll random event
    const roll = Math.random();
    if (roll < 0.60) {
      const pool = ENCOUNTER_POOLS[node.id] ?? ['enc-bandits'];
      const encId = pool[Math.floor(Math.random() * pool.length)];
      setEvent({ phase: 'battle-ready', node, encounterId: encId });
    } else if (roll < 0.85) {
      const coins = Math.floor(Math.random() * 80) + 40;
      const rubies = Math.random() < 0.2 ? 1 : 0;
      setEvent({ phase: 'loot', node, coins, rubies });
    } else {
      const text = REST_TEXTS[Math.floor(Math.random() * REST_TEXTS.length)];
      setEvent({ phase: 'rest', node, text });
    }
  }

  function claimLoot() {
    if (event?.phase !== 'loot') return;
    addCoins(event.coins);
    if (event.rubies) addRubies(event.rubies);
    setEvent(null);
  }

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-slate-950 p-4">
      <div className="flex items-center gap-3">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <h2 className="text-xl font-bold text-amber-200">Travel</h2>
      </div>

      {activeTeamIds.length < 3 && (
        <div className="rounded-lg border border-yellow-700/40 bg-yellow-900/20 px-3 py-2 text-sm text-yellow-300">
          ⚠ Set a full 3-character party before entering combat.
        </div>
      )}

      {/* Map */}
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-amber-900/30"
        style={{
          height: '420px',
          background:
            'radial-gradient(ellipse at 25% 35%, #1e1306 0%, #110d03 55%, #080601 100%)',
        }}
      >
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #c8952a 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* SVG path lines */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {CONNECTIONS.map(([a, b]) => (
            <line
              key={`${a.id}-${b.id}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="#6b4c1a"
              strokeWidth="0.55"
              strokeDasharray="1.4 1.1"
              opacity="0.75"
            />
          ))}
        </svg>

        {/* Map nodes */}
        {MAP_NODES.map((node) => {
          const stageAccessible = node.type === 'stage' ? isStageAccessible(node) : true;
          const fullyLocked = node.locked || (node.type === 'stage' && !stageAccessible);
          const isActive = event?.node?.id === node.id;

          return (
            <button
              key={node.id}
              onClick={() => handleNodeClick(node)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 group"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {/* Danger dot */}
              <div className="flex items-center gap-1 mb-0.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${DANGER_DOT[node.danger]} ${fullyLocked ? 'opacity-30' : ''}`}
                />
              </div>
              {/* Emoji icon */}
              <div
                className={`text-xl leading-none transition-transform duration-150 ${
                  isActive ? 'scale-125' : 'group-hover:scale-110'
                } ${fullyLocked ? 'grayscale opacity-35' : ''}`}
              >
                {node.emoji}
              </div>
              {/* Label */}
              <div
                className={`whitespace-nowrap rounded border px-1.5 py-0.5 text-[9px] font-semibold leading-none ${
                  isActive
                    ? 'border-white/40 bg-slate-900/95 text-white'
                    : 'border-slate-700/50 bg-slate-900/80 text-slate-400'
                } ${fullyLocked ? 'opacity-40' : ''}`}
              >
                {node.name}
              </div>
            </button>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-2 left-3 flex flex-col gap-1">
          {(['safe', 'easy', 'medium', 'hard'] as const).map((d) => (
            <div key={d} className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${DANGER_DOT[d]}`} />
              <span className="text-[9px] text-slate-600">{DANGER_LABEL[d]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event panel */}
      {event && (
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/95 p-5">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-amber-200">
                {event.node.emoji} {event.node.name}
              </h3>
              <span className={`text-xs font-semibold ${DANGER_COLOR[event.node.danger]}`}>
                {DANGER_LABEL[event.node.danger]} area
              </span>
            </div>
            <button
              className="text-slate-500 hover:text-white transition text-lg leading-none"
              onClick={() => setEvent(null)}
            >
              ✕
            </button>
          </div>

          {event.phase === 'approach' && (
            <>
              <p className="mb-4 text-sm leading-relaxed text-slate-300">{event.node.desc}</p>
              {event.node.locked && (
                <div className="text-sm italic text-slate-500">🔒 Coming soon...</div>
              )}
              {event.node.type === 'stage' && !event.node.locked && (
                isStageAccessible(event.node) ? (
                  <button
                    className="btn"
                    disabled={activeTeamIds.length < 3}
                    onClick={() => onBattle(event.node.stageId!)}
                  >
                    ⚔️ Enter Battle
                  </button>
                ) : (
                  <div className="text-sm text-red-400">
                    🔒 Defeat the previous area first to unlock this location.
                  </div>
                )
              )}
              {(event.node.type === 'town' || event.node.type === 'city') && !event.node.locked && (
                <div className="text-sm text-green-400">🏠 A safe haven. You may rest here.</div>
              )}
            </>
          )}

          {event.phase === 'battle-ready' && (
            <>
              <p className="mb-1 text-sm text-slate-300">{event.node.desc}</p>
              <p className="mb-4 text-sm font-semibold text-red-300">⚠ Enemies spotted! Engage or retreat?</p>
              <div className="flex gap-3">
                <button
                  className="btn"
                  disabled={activeTeamIds.length < 3}
                  onClick={() => onBattle(event.encounterId)}
                >
                  ⚔️ Engage!
                </button>
                <button className="btn-secondary" onClick={() => setEvent(null)}>
                  Retreat
                </button>
              </div>
            </>
          )}

          {event.phase === 'loot' && (
            <>
              <p className="mb-4 text-sm text-slate-300">
                While exploring, you stumble upon something valuable left behind...
              </p>
              <div className="mb-4 flex gap-5">
                {event.coins > 0 && (
                  <div className="flex items-center gap-2 font-bold text-yellow-300">
                    <span className="text-2xl">🪙</span>
                    <span>+{event.coins} Coins</span>
                  </div>
                )}
                {event.rubies > 0 && (
                  <div className="flex items-center gap-2 font-bold text-red-300">
                    <span className="text-2xl">💎</span>
                    <span>+{event.rubies} Ruby</span>
                  </div>
                )}
              </div>
              <button className="btn" onClick={claimLoot}>
                Collect!
              </button>
            </>
          )}

          {event.phase === 'rest' && (
            <>
              <p className="mb-4 text-sm italic leading-relaxed text-slate-300">"{event.text}"</p>
              <button className="btn-secondary" onClick={() => setEvent(null)}>
                Continue
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
