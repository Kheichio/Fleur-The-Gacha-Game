import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import CurrencyBar from './CurrencyBar';

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
    emoji: '⬡',
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
  'A strange silence falls. For now, the path ahead is clear.',
  'An abandoned campfire, still warm — someone was here not long ago.',
  'A luminous flower grows between the stones. Its petals shimmer faintly with a light you cannot explain.',
  'Nothing stirs. You take a breath and press onward.',
];

const DANGER_LABEL: Record<string, string> = { safe: 'Safe', easy: 'Easy', medium: 'Moderate', hard: 'Dangerous' };
const DANGER_COLOR: Record<string, string> = { safe: 'text-green-400', easy: 'text-yellow-300', medium: 'text-orange-400', hard: 'text-red-400' };
const DANGER_DOT: Record<string, string> = { safe: 'bg-green-400', easy: 'bg-yellow-300', medium: 'bg-orange-400', hard: 'bg-red-400' };

interface Props {
  onBack: () => void;
  onBattle: (id: string) => void;
}

export default function TravelScreen({ onBack, onBattle }: Props) {
  const unlockedStageIds = useGameStore((s) => s.unlockedStageIds);
  const activeTeamIds = useGameStore((s) => s.activeTeamIds);
  const currentNodeId = useGameStore((s) => s.currentNodeId);
  const addCoins = useGameStore((s) => s.addCoins);
  const addRubies = useGameStore((s) => s.addRubies);
  const moveToNode = useGameStore((s) => s.moveToNode);

  const [event, setEvent] = useState<EventState | null>(null);

  const currentNode = MAP_NODES.find((n) => n.id === currentNodeId) ?? MAP_NODES[0];
  const reachableIds = new Set(currentNode.connections);

  // First active party member portrait for avatar
  const avatarChar = activeTeamIds[0] ? CHARACTER_POOL.find((c) => c.id === activeTeamIds[0]) : null;

  function isStageAccessible(node: MapNode): boolean {
    return node.type === 'stage' && !!node.stageId && unlockedStageIds.includes(node.stageId);
  }

  function triggerNodeEvent(node: MapNode) {
    if (node.type === 'town' || node.type === 'city' || node.type === 'stage') {
      setEvent({ phase: 'approach', node });
      return;
    }
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

  function handleNodeClick(node: MapNode) {
    if (node.id === currentNodeId) {
      triggerNodeEvent(node);
      return;
    }
    if (!reachableIds.has(node.id)) return;
    moveToNode(node.id);
    setEvent(null);
    triggerNodeEvent(node);
  }

  function claimLoot() {
    if (event?.phase !== 'loot') return;
    addCoins(event.coins);
    if (event.rubies) addRubies(event.rubies);
    setEvent(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={onBack}>← Back</button>
          <h2 style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-xl font-bold text-amber-200">
            Travel
          </h2>
        </div>
        <CurrencyBar />
      </div>

      <div className="flex flex-col gap-4 p-4">
        {activeTeamIds.length < 3 && (
          <div className="rounded-lg border border-yellow-700/40 bg-yellow-900/20 px-3 py-2 text-sm text-yellow-300">
            ⚠ Set a full 3-character party before entering combat.
          </div>
        )}

        {/* Location info */}
        <div className="text-sm text-slate-400">
          <span className="text-slate-500">Currently at: </span>
          <span className="font-semibold text-amber-300">{currentNode.emoji} {currentNode.name}</span>
          <span className="ml-2 text-xs text-slate-600">· Click adjacent nodes to move · Click current node to interact</span>
        </div>

        {/* MAP */}
        <div
          className="relative w-full overflow-hidden rounded-2xl border border-amber-900/30"
          style={{
            height: '580px',
            background: 'radial-gradient(ellipse at 25% 35%, #1e1306 0%, #110d03 55%, #080601 100%)',
          }}
        >
          {/* Dot-grid texture */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle, #c8952a 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* SVG paths */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {CONNECTIONS.map(([a, b]) => (
              <line
                key={`${a.id}-${b.id}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="#6b4c1a" strokeWidth="0.5" strokeDasharray="1.3 1" opacity="0.8"
              />
            ))}
          </svg>

          {/* Player avatar on current node */}
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2"
            style={{ left: `${currentNode.x}%`, top: `${Math.max(3, currentNode.y - 15)}%` }}
          >
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-yellow-400 bg-slate-700 shadow-lg shadow-yellow-500/30 animate-bounce">
                {avatarChar?.image ? (
                  <img src={avatarChar.image} alt="you" className="h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-black text-yellow-300">
                    {avatarChar ? avatarChar.name.charAt(0) : '⚔'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map nodes */}
          {MAP_NODES.map((node) => {
            const isCurrent = node.id === currentNodeId;
            const isReachable = reachableIds.has(node.id);
            const stageAccessible = node.type === 'stage' ? isStageAccessible(node) : true;
            const fullyLocked = node.locked || (node.type === 'stage' && !stageAccessible);
            const isActive = event?.node?.id === node.id;
            const clickable = isCurrent || isReachable;

            return (
              <button
                key={node.id}
                onClick={() => handleNodeClick(node)}
                disabled={!clickable}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all duration-150 ${
                  clickable ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                {/* Danger dot */}
                <span className={`h-2 w-2 rounded-full ${DANGER_DOT[node.danger]} ${fullyLocked ? 'opacity-25' : ''}`} />
                {/* Emoji */}
                <div
                  className={`text-3xl leading-none transition-transform duration-150 ${
                    isCurrent
                      ? 'scale-125 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                      : isReachable
                      ? 'scale-110 opacity-90 hover:scale-125'
                      : 'scale-90 opacity-30'
                  } ${fullyLocked ? 'grayscale' : ''} ${isActive ? 'animate-pulse' : ''}`}
                >
                  {node.emoji}
                </div>
                {/* Label */}
                <div
                  className={`whitespace-nowrap rounded border px-2 py-0.5 text-xs font-semibold leading-snug transition-all ${
                    isCurrent
                      ? 'border-yellow-500/60 bg-yellow-950/90 text-yellow-300'
                      : isReachable
                      ? 'border-slate-500/60 bg-slate-900/90 text-slate-200'
                      : 'border-slate-800/40 bg-slate-950/70 text-slate-600'
                  } ${fullyLocked ? 'opacity-40' : ''}`}
                >
                  {node.name}
                </div>
              </button>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 bg-slate-950/60 rounded-lg p-2">
            {(['safe', 'easy', 'medium', 'hard'] as const).map((d) => (
              <div key={d} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${DANGER_DOT[d]}`} />
                <span className="text-xs text-slate-500">{DANGER_LABEL[d]}</span>
              </div>
            ))}
            <div className="mt-1 border-t border-slate-800 pt-1 text-[10px] text-slate-600">
              🌟 = current · bright = reachable
            </div>
          </div>
        </div>

        {/* Event panel */}
        {event && (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/95 p-5 shadow-xl">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-lg font-bold text-amber-200">
                  {event.node.emoji} {event.node.name}
                </h3>
                <span className={`text-xs font-semibold ${DANGER_COLOR[event.node.danger]}`}>
                  {DANGER_LABEL[event.node.danger]} area
                </span>
              </div>
              <button
                className="text-slate-500 hover:text-white transition text-xl leading-none"
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
                    <div className="text-sm text-red-400">🔒 Defeat the previous area first to unlock this location.</div>
                  )
                )}
                {(event.node.type === 'town' || event.node.type === 'city') && !event.node.locked && (
                  <div className="text-sm text-green-400">🏠 A safe haven. You may rest here freely.</div>
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
                  <button className="btn-secondary" onClick={() => setEvent(null)}>Retreat</button>
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
                <button className="btn" onClick={claimLoot}>Collect!</button>
              </>
            )}

            {event.phase === 'rest' && (
              <>
                <p className="mb-4 text-sm italic leading-relaxed text-slate-300">"{event.text}"</p>
                <button className="btn-secondary" onClick={() => setEvent(null)}>Continue</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
