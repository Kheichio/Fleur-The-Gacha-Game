import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import { effectiveStats } from '../systems/leveling';
import PageHeader from './PageHeader';

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
    id: 'tesialyrodi',
    name: 'Tesialyrodi',
    emoji: '🏘️',
    x: 5, y: 50,
    type: 'town', danger: 'safe',
    desc: 'A walled town of 20,991 souls built on the banks of a wide river. Its great church bell tolls each dawn. Róza Défteros is the daughter of the Lord who governs it, and Auxentios Brígach serves among the town guard.',
    connections: ['riverside-crossing'],
  },
  {
    id: 'riverside-crossing',
    name: 'Riverside Crossing',
    emoji: '🌊',
    x: 16, y: 42,
    type: 'stage', danger: 'easy',
    stageId: 'stage-1',
    desc: 'A stone bridge over the river, worn smooth by centuries of trade. Lately, thugs have begun demanding a toll from travellers.',
    connections: ['tesialyrodi', 'sunlit-grasslands'],
  },
  {
    id: 'sunlit-grasslands',
    name: 'Sunlit Grasslands',
    emoji: '🌾',
    x: 28, y: 55,
    type: 'wilderness', danger: 'easy',
    desc: 'Endless golden grass stretches to the horizon, broken only by the wind. Wolves stalk through the tall stalks, hunting in packs.',
    connections: ['riverside-crossing', 'abandoned-farmstead', 'scattered-copse'],
  },
  {
    id: 'abandoned-farmstead',
    name: 'Abandoned Farmstead',
    emoji: '🏚️',
    x: 38, y: 38,
    type: 'stage', danger: 'medium',
    stageId: 'stage-2',
    desc: 'A crumbling homestead swallowed by weeds. Feral hounds and desperate squatters have made it their den. The well still holds water, but the silence here feels wrong.',
    connections: ['sunlit-grasslands', 'broken-watchtower'],
  },
  {
    id: 'scattered-copse',
    name: 'Scattered Copse',
    emoji: '🌳',
    x: 40, y: 68,
    type: 'wilderness', danger: 'medium',
    desc: 'A lonely cluster of trees rising from the grasslands. Bandits are known to camp in their shade, ambushing travellers on the road.',
    connections: ['sunlit-grasslands', 'broken-watchtower'],
  },
  {
    id: 'broken-watchtower',
    name: 'Broken Watchtower',
    emoji: '🗼',
    x: 52, y: 50,
    type: 'stage', danger: 'medium',
    stageId: 'stage-3',
    desc: 'The ruins of an ancient watchtower, half-collapsed and overgrown. Strange lights have been seen in its upper floors at night — shades of the soldiers who once manned it.',
    connections: ['abandoned-farmstead', 'scattered-copse', 'windswept-plains'],
  },
  {
    id: 'windswept-plains',
    name: 'Windswept Plains',
    emoji: '🌬️',
    x: 64, y: 42,
    type: 'wilderness', danger: 'medium',
    desc: 'The grass here grows shorter, beaten flat by relentless wind. There is no shelter, no landmark — only the road and whatever walks it.',
    connections: ['broken-watchtower', 'hollow-shrine', 'old-stone-bridge'],
  },
  {
    id: 'hollow-shrine',
    name: 'Hollow Shrine',
    emoji: '⛩️',
    x: 74, y: 58,
    type: 'stage', danger: 'hard',
    stageId: 'stage-4',
    desc: 'A roadside shrine whose deity has been forgotten. Offerings still appear on its steps, left by no one. The spirits here do not welcome the living.',
    connections: ['windswept-plains', 'bypethenos-approach'],
  },
  {
    id: 'old-stone-bridge',
    name: 'Old Stone Bridge',
    emoji: '🪨',
    x: 76, y: 32,
    type: 'wilderness', danger: 'hard',
    desc: 'A crumbling bridge of ancient stonework spanning a dried-up riverbed. Mercenary sellswords have claimed it as a toll point.',
    connections: ['windswept-plains', 'bypethenos-approach'],
  },
  {
    id: 'bypethenos-approach',
    name: 'Gates of Bypethenos',
    emoji: '⚔️',
    x: 86, y: 45,
    type: 'stage', danger: 'hard',
    stageId: 'stage-5',
    desc: 'The road narrows between stone walls as the great city of Bypethenos looms ahead. The gate guard does not let strangers pass without proving their strength.',
    connections: ['hollow-shrine', 'old-stone-bridge', 'bypethenos'],
  },
  {
    id: 'bypethenos',
    name: 'Bypethenos',
    emoji: '🏰',
    x: 95, y: 50,
    type: 'city', danger: 'safe',
    desc: 'A great walled city of 55,982 souls. Its castle overlooks a bustling town centre, and the cathedral spires pierce the sky. Merchants, scholars, and soldiers fill its streets.',
    connections: ['bypethenos-approach'],
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
  'sunlit-grasslands': ['enc-grass-wolves'],
  'scattered-copse': ['enc-bandits'],
  'windswept-plains': ['enc-bandits', 'enc-grass-wolves'],
  'old-stone-bridge': ['enc-mercenaries', 'enc-ruins-spirits'],
};

const REST_TEXTS = [
  'The grass sways gently. For now, the road ahead is clear.',
  'An abandoned campfire, still warm — someone was here not long ago.',
  'A single flower grows between cracked stones. Its petals shimmer faintly in the wind.',
  'Nothing stirs but the wind. You take a breath and press onward.',
  'You find the remains of a merchant\'s cart, long since picked clean. The road is not kind.',
  'A hawk circles far overhead. Below, the grasslands stretch endlessly in every direction.',
];

const DANGER_LABEL: Record<string, string> = { safe: 'Safe', easy: 'Easy', medium: 'Moderate', hard: 'Dangerous' };
const DANGER_COLOR: Record<string, string> = { safe: 'text-green-400', easy: 'text-yellow-300', medium: 'text-orange-400', hard: 'text-red-400' };
const DANGER_DOT: Record<string, string> = { safe: 'bg-green-400', easy: 'bg-yellow-300', medium: 'bg-orange-400', hard: 'bg-red-400' };
const NODE_GLOW: Record<string, string> = { safe: 'shadow-green-500/30', easy: 'shadow-yellow-500/30', medium: 'shadow-orange-500/30', hard: 'shadow-red-500/30' };

const AREA_MAP: Record<string, string> = {
  tesialyrodi: 'town', 'riverside-crossing': 'meadow', 'sunlit-grasslands': 'meadow',
  'abandoned-farmstead': 'meadow', 'scattered-copse': 'forest', 'broken-watchtower': 'ruins',
  'windswept-plains': 'meadow', 'hollow-shrine': 'ruins', 'old-stone-bridge': 'crossroads',
  'bypethenos-approach': 'gate', bypethenos: 'town',
};

const REST_COST = 200;

interface Props {
  onBack: () => void;
  onBattle: (id: string, area?: string) => void;
}

export default function TravelScreen({ onBack, onBattle }: Props) {
  const unlockedStageIds = useGameStore((s) => s.unlockedStageIds);
  const activeTeamIds = useGameStore((s) => s.activeTeamIds);
  const currentNodeId = useGameStore((s) => s.currentNodeId);
  const coins = useGameStore((s) => s.coins);
  const currentHp = useGameStore((s) => s.currentHp) ?? {};
  const characterData = useGameStore((s) => s.characterData);
  const addCoins = useGameStore((s) => s.addCoins);
  const addRubies = useGameStore((s) => s.addRubies);
  const moveToNode = useGameStore((s) => s.moveToNode);
  const restAtTown = useGameStore((s) => s.restAtTown);

  const [event, setEvent] = useState<EventState | null>(null);
  const [nodeEvents, setNodeEvents] = useState<Record<string, EventState>>({});

  const currentNode = MAP_NODES.find((n) => n.id === currentNodeId) ?? MAP_NODES[0];
  const reachableIds = new Set(currentNode.connections);

  const avatarChar = activeTeamIds[0] ? CHARACTER_POOL.find((c) => c.id === activeTeamIds[0]) : null;

  function isStageAccessible(node: MapNode): boolean {
    return node.type === 'stage' && !!node.stageId && unlockedStageIds.includes(node.stageId);
  }

  function generateNodeEvent(node: MapNode): EventState {
    const roll = Math.random();
    if (roll < 0.60) {
      const pool = ENCOUNTER_POOLS[node.id] ?? ['enc-bandits'];
      const encId = pool[Math.floor(Math.random() * pool.length)];
      return { phase: 'battle-ready', node, encounterId: encId };
    } else if (roll < 0.85) {
      const coins = Math.floor(Math.random() * 80) + 40;
      const rubies = Math.random() < 0.2 ? 1 : 0;
      return { phase: 'loot', node, coins, rubies };
    } else {
      const text = REST_TEXTS[Math.floor(Math.random() * REST_TEXTS.length)];
      return { phase: 'rest', node, text };
    }
  }

  function triggerNodeEvent(node: MapNode) {
    if (node.type === 'town' || node.type === 'city' || node.type === 'stage') {
      setEvent({ phase: 'approach', node });
      return;
    }
    // Use cached event for wilderness/ruins, or generate + cache a new one
    const cached = nodeEvents[node.id];
    if (cached) {
      setEvent(cached);
    } else {
      const ev = generateNodeEvent(node);
      setNodeEvents((prev) => ({ ...prev, [node.id]: ev }));
      setEvent(ev);
    }
  }

  function clearNodeEvent(nodeId: string) {
    setNodeEvents((prev) => {
      const next = { ...prev };
      delete next[nodeId];
      return next;
    });
    setEvent(null);
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
    clearNodeEvent(event.node.id);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#070d1a] text-slate-100">
      <PageHeader title="Travel" onBack={onBack} />

      {activeTeamIds.length < 3 && (
        <div className="flex-shrink-0 mx-5 mt-3 rounded-lg border border-yellow-700/40 bg-yellow-900/20 px-3 py-2 text-sm text-yellow-300">
          Set a full 3-character party before entering combat.
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Map area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Map background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 30% 40%, #1e1306 0%, #110d03 50%, #080601 100%)',
            }}
          />

          {/* Fog of war overlay */}
          <div className="pointer-events-none absolute inset-0" style={{
            background: `radial-gradient(circle at ${currentNode.x}% ${currentNode.y}%, transparent 15%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.75) 70%)`,
          }} />

          {/* Dot-grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #c8952a 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* SVG paths */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {CONNECTIONS.map(([a, b]) => {
              const aReachable = a.id === currentNodeId || reachableIds.has(a.id);
              const bReachable = b.id === currentNodeId || reachableIds.has(b.id);
              const bright = aReachable && bReachable;
              return (
                <line
                  key={`${a.id}-${b.id}`}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={bright ? '#a67c32' : '#3d2e12'}
                  strokeWidth={bright ? '0.6' : '0.4'}
                  strokeDasharray={bright ? '2 1' : '1.3 1.5'}
                  opacity={bright ? 1 : 0.4}
                />
              );
            })}
          </svg>

          {/* Player avatar on current node */}
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2"
            style={{ left: `${currentNode.x}%`, top: `${Math.max(3, currentNode.y - 12)}%` }}
          >
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-yellow-400 bg-slate-700 shadow-lg shadow-yellow-500/40 animate-bounce">
                {avatarChar?.image ? (
                  <img src={avatarChar.image} alt="you" className="h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-black text-yellow-300">
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
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-all duration-200 group ${
                  clickable ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                {/* Glow ring for current */}
                {isCurrent && (
                  <div className="absolute inset-0 -m-2 rounded-full bg-yellow-400/10 animate-ping" style={{ animationDuration: '2s' }} />
                )}
                {/* Node circle */}
                <div className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl transition-all duration-200 ${
                  isCurrent
                    ? `border-yellow-400 bg-yellow-950/80 shadow-lg ${NODE_GLOW[node.danger]}`
                    : isReachable
                    ? `border-amber-600/60 bg-amber-950/60 group-hover:border-amber-400 group-hover:scale-110 shadow-md ${NODE_GLOW[node.danger]}`
                    : 'border-slate-700/30 bg-slate-900/40'
                } ${fullyLocked ? 'grayscale opacity-40' : ''} ${isActive ? 'scale-110' : ''}`}>
                  {node.emoji}
                  {/* Danger dot */}
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-black ${DANGER_DOT[node.danger]} ${fullyLocked ? 'opacity-25' : ''}`} />
                </div>
                {/* Label */}
                <div className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-yellow-950/90 text-yellow-300 border border-yellow-600/40'
                    : isReachable
                    ? 'bg-slate-900/90 text-slate-200 border border-slate-700/40 group-hover:text-amber-200'
                    : 'bg-slate-950/60 text-slate-700 border border-slate-800/20'
                } ${fullyLocked ? 'opacity-40' : ''}`}>
                  {node.name}
                </div>
              </button>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 rounded-xl bg-black/60 backdrop-blur-sm border border-slate-800/40 p-3">
            {(['safe', 'easy', 'medium', 'hard'] as const).map((d) => (
              <div key={d} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${DANGER_DOT[d]}`} />
                <span className="text-[10px] text-slate-400">{DANGER_LABEL[d]}</span>
              </div>
            ))}
          </div>

          {/* Current location indicator */}
          <div className="absolute top-3 left-3 rounded-xl bg-black/60 backdrop-blur-sm border border-slate-800/40 px-4 py-2">
            <div className="text-[9px] uppercase tracking-wider text-slate-600">Location</div>
            <div className="text-sm font-bold text-amber-300">{currentNode.emoji} {currentNode.name}</div>
          </div>
        </div>

        {/* Event panel — right sidebar */}
        <div className="w-80 flex-shrink-0 border-l border-slate-800/60 bg-slate-950/60 flex flex-col">
          {event ? (
            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{event.node.emoji}</span>
                  <h3 style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-lg font-bold text-amber-200">
                    {event.node.name}
                  </h3>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${DANGER_COLOR[event.node.danger]}`}>
                  <span className={`h-2 w-2 rounded-full ${DANGER_DOT[event.node.danger]}`} />
                  {DANGER_LABEL[event.node.danger]} area
                </span>
              </div>

              <div className="h-px bg-slate-800/60 mb-4" />

              {event.phase === 'approach' && (
                <>
                  <p style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="mb-5 text-sm italic leading-relaxed text-slate-400">
                    "{event.node.desc}"
                  </p>
                  {event.node.locked && (
                    <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-3 text-sm text-slate-500">🔒 Coming soon...</div>
                  )}
                  {event.node.type === 'stage' && !event.node.locked && (
                    isStageAccessible(event.node) ? (
                      <button
                        className="w-full rounded-xl border border-red-700/50 bg-red-950/50 py-3 text-sm font-bold text-red-200 transition hover:bg-red-900/60"
                        disabled={activeTeamIds.length < 3}
                        onClick={() => onBattle(event.node.stageId!, AREA_MAP[event.node.id])}
                      >
                        ⚔️ Enter Battle
                      </button>
                    ) : (
                      <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-3 text-sm text-red-400">
                        🔒 Defeat the previous area first.
                      </div>
                    )
                  )}
                  {(event.node.type === 'town' || event.node.type === 'city') && !event.node.locked && (
                    <div className="flex flex-col gap-3">
                      {/* Party HP status */}
                      <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 p-3">
                        <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-600">Party Status</div>
                        {activeTeamIds.map((id) => {
                          const ch = CHARACTER_POOL.find((c) => c.id === id);
                          if (!ch) return null;
                          const d = characterData[id] ?? { level: 1, xp: 0, enhancement: 0 };
                          const maxHp = effectiveStats(ch.stats, d.level, d.enhancement).hp;
                          const hp = currentHp[id] ?? maxHp;
                          const pct = Math.round((hp / maxHp) * 100);
                          return (
                            <div key={id} className="flex items-center gap-2 py-1">
                              <span className="w-20 truncate text-xs font-semibold text-slate-300">{ch.name.split(' ')[0]}</span>
                              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div className={`h-full rounded-full ${pct > 50 ? 'bg-green-400' : pct > 25 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[10px] text-slate-500 w-16 text-right">{hp}/{maxHp}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Inn — rest and heal */}
                      <button
                        onClick={() => { restAtTown(REST_COST); }}
                        disabled={coins < REST_COST}
                        className="w-full rounded-xl border border-green-700/40 bg-green-950/30 py-3 text-sm font-bold text-green-300 transition hover:bg-green-900/40 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        🏨 Rest at Inn — Heal All ({REST_COST} 🪙)
                      </button>

                      {/* Fight bandits */}
                      <button
                        onClick={() => onBattle('town-bandits', 'town')}
                        disabled={activeTeamIds.length < 3}
                        className="w-full rounded-xl border border-red-700/40 bg-red-950/30 py-3 text-sm font-bold text-red-300 transition hover:bg-red-900/40 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ⚔️ Fight Town Bandits
                      </button>

                      <div className="text-[10px] text-slate-700 italic text-center">
                        🏠 A safe haven — rest to restore your party's health.
                      </div>
                    </div>
                  )}
                </>
              )}

              {event.phase === 'battle-ready' && (
                <>
                  <p className="mb-2 text-sm text-slate-400">{event.node.desc}</p>
                  <div className="mb-4 rounded-lg border border-red-800/40 bg-red-950/30 p-3 text-sm font-semibold text-red-300 animate-pulse">
                    Enemies spotted ahead!
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      className="w-full rounded-xl border border-red-700/50 bg-red-950/50 py-3 text-sm font-bold text-red-200 transition hover:bg-red-900/60"
                      disabled={activeTeamIds.length < 3}
                      onClick={() => { clearNodeEvent(event.node.id); onBattle(event.encounterId, AREA_MAP[event.node.id]); }}
                    >
                      ⚔️ Engage!
                    </button>
                    <button
                      className="w-full rounded-xl border border-slate-700/40 py-2 text-xs text-slate-500 transition hover:text-slate-300"
                      onClick={() => setEvent(null)}
                    >
                      Retreat
                    </button>
                  </div>
                </>
              )}

              {event.phase === 'loot' && (
                <>
                  <p className="mb-4 text-sm text-slate-400">
                    While exploring, you stumble upon something valuable...
                  </p>
                  <div className="mb-4 flex flex-col gap-2 rounded-xl border border-yellow-700/30 bg-yellow-950/20 p-4">
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
                  <button
                    className="w-full rounded-xl border border-yellow-700/50 bg-yellow-950/50 py-3 text-sm font-bold text-yellow-200 transition hover:bg-yellow-900/60"
                    onClick={claimLoot}
                  >
                    Collect!
                  </button>
                </>
              )}

              {event.phase === 'rest' && (
                <>
                  <p style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="mb-5 text-sm italic leading-relaxed text-slate-400">
                    "{event.text}"
                  </p>
                  <button
                    className="w-full rounded-xl border border-slate-700/40 py-2 text-sm text-slate-400 transition hover:text-white"
                    onClick={() => clearNodeEvent(event.node.id)}
                  >
                    Continue
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-5">
              <div className="text-center text-slate-700">
                <div className="text-4xl mb-3">🗺️</div>
                <div className="text-sm font-semibold">Select a Location</div>
                <div className="mt-1 text-xs text-slate-800">Click your current node or an adjacent one</div>
              </div>
            </div>
          )}

          {/* Close event */}
          {event && (
            <div className="flex-shrink-0 border-t border-slate-800/60 p-3">
              <button
                onClick={() => setEvent(null)}
                className="w-full rounded-xl border border-slate-800 py-2 text-xs font-semibold text-slate-600 transition hover:text-slate-400"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
