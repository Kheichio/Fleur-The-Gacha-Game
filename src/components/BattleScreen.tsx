import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import { STAGES } from '../data/stages';
import { ENCOUNTERS } from '../data/encounters';
import { ITEM_DEFS } from '../data/items';
import type { BattleUnit } from '../types';
import { buildTurnOrder, calcDamage, pickTarget, toBattleUnit } from '../systems/battle';
import { effectiveStats } from '../systems/leveling';
import { playMeleeHit, playMagicHit, playHeal } from '../systems/audio';

interface Props {
  stageId: string;
  onExit: () => void;
}

type Status = 'ongoing' | 'won' | 'lost';
type ActionPhase = 'idle' | 'choose' | 'pick-enemy' | 'pick-item' | 'pick-ally';

export default function BattleScreen({ stageId, onExit }: Props) {
  const activeTeamIds = useGameStore((s) => s.activeTeamIds);
  const characterData = useGameStore((s) => s.characterData);
  const completeStage = useGameStore((s) => s.completeStage);
  const gainXp = useGameStore((s) => s.gainXp);
  const items = useGameStore((s) => s.items);
  const spendItem = useGameStore((s) => s.spendItem);

  const stage = useMemo(() => [...STAGES, ...ENCOUNTERS].find((s) => s.id === stageId)!, [stageId]);

  const initialUnits = useMemo(() => {
    const playerUnits = activeTeamIds
      .map((id) => CHARACTER_POOL.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => {
        const d = characterData[c.id] ?? { level: 1, xp: 0, enhancement: 0 };
        return toBattleUnit({ ...c, stats: effectiveStats(c.stats, d.level, d.enhancement) }, true);
      });
    const enemyUnits = stage.enemyTeam.map((c) => toBattleUnit(c, false));
    return [...playerUnits, ...enemyUnits];
  }, []);

  const [units, setUnits] = useState<BattleUnit[]>(initialUnits);
  const [order, setOrder] = useState<BattleUnit[]>(() => buildTurnOrder(initialUnits));
  const [turnIndex, setTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [log, setLog] = useState<string[]>([`${stage.name} — Round 1 begins!`]);
  const [status, setStatus] = useState<Status>('ongoing');
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [actionPhase, setActionPhase] = useState<ActionPhase>('idle');
  const [pendingAction, setPendingAction] = useState<'attack' | 'skill' | null>(null);
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [hitFlash, setHitFlash] = useState<{ uid: string; type: 'phys' | 'magic' | 'heal' } | null>(null);

  function appendLog(text: string) {
    setLog((l) => [...l.slice(-20), text]);
  }

  function flashUnit(uid: string, type: 'phys' | 'magic' | 'heal') {
    setHitFlash({ uid, type });
    setTimeout(() => setHitFlash((prev) => (prev?.uid === uid ? null : prev)), 360);
  }

  function startNewRound(currentUnits: BattleUnit[]) {
    const decremented = currentUnits.map((u) => ({
      ...u,
      skillCooldownRemaining: Math.max(0, u.skillCooldownRemaining - 1),
    }));
    setUnits(decremented);
    setOrder(buildTurnOrder(decremented.filter((u) => u.alive)));
    setTurnIndex(0);
    setRound((r) => r + 1);
  }

  function advanceTurn(updatedUnits: BattleUnit[]) {
    const nextIndex = turnIndex + 1;
    if (nextIndex >= order.length) {
      startNewRound(updatedUnits);
    } else {
      setUnits(updatedUnits);
      setTurnIndex(nextIndex);
    }
  }

  function applyDamage(currentUnits: BattleUnit[], targetUid: string, amount: number): BattleUnit[] {
    return currentUnits.map((u) => {
      if (u.uid !== targetUid) return u;
      const newHp = Math.max(0, u.currentHp - amount);
      return { ...u, currentHp: newHp, alive: newHp > 0 };
    });
  }

  function checkOutcome(updated: BattleUnit[]): Status {
    if (!updated.some((u) => !u.isPlayer && u.alive)) return 'won';
    if (!updated.some((u) => u.isPlayer && u.alive)) return 'lost';
    return 'ongoing';
  }

  function executeAction(actor: BattleUnit, target: BattleUnit, type: 'attack' | 'skill') {
    const useSkill = type === 'skill' && actor.skillCooldownRemaining === 0;
    const skillType = actor.character.skill.type ?? 'melee';
    const multiplier = useSkill ? actor.character.skill.multiplier : 1;
    const damage = calcDamage(actor, target, multiplier);

    if (useSkill && skillType === 'magic') {
      playMagicHit();
      flashUnit(target.uid, 'magic');
    } else {
      playMeleeHit();
      flashUnit(target.uid, 'phys');
    }

    let updated = applyDamage(units, target.uid, damage);
    if (useSkill) {
      updated = updated.map((u) =>
        u.uid === actor.uid ? { ...u, skillCooldownRemaining: actor.character.skill.cooldown } : u
      );
    }

    const defeated = damage >= target.currentHp;
    appendLog(
      `${actor.character.name} ${useSkill ? `uses ${actor.character.skill.name} on` : 'attacks'} ${target.character.name} for ${damage}${defeated ? ' — defeated!' : '.'}`
    );

    const outcome = checkOutcome(updated);
    setStatus(outcome);
    setActionPhase('idle');
    setPendingAction(null);
    if (outcome === 'ongoing') {
      advanceTurn(updated);
    } else {
      setUnits(updated);
    }
  }

  function handleEnemyClick(target: BattleUnit) {
    if (actionPhase !== 'pick-enemy' || !pendingAction || !target.alive) return;
    const actor = units.find((u) => u.uid === order[turnIndex]?.uid);
    if (!actor) return;
    executeAction(actor, target, pendingAction);
  }

  function handleAllyClick(ally: BattleUnit) {
    if (actionPhase !== 'pick-ally' || !pendingItem || !ally.alive) return;
    const actor = units.find((u) => u.uid === order[turnIndex]?.uid);
    if (!actor) return;
    const def = ITEM_DEFS[pendingItem];
    if (!def) return;

    const healed = Math.min(ally.maxHp, ally.currentHp + def.value) - ally.currentHp;
    const updated = units.map((u) =>
      u.uid === ally.uid ? { ...u, currentHp: Math.min(u.maxHp, u.currentHp + def.value) } : u
    );
    playHeal();
    flashUnit(ally.uid, 'heal');
    spendItem(pendingItem);
    appendLog(`${actor.character.name} uses ${def.emoji} ${def.name} on ${ally.character.name} (+${healed} HP).`);
    setUnits(updated);
    setPendingItem(null);
    setActionPhase('idle');
    advanceTurn(updated);
  }

  // Enemy auto-turn and dead-unit skip
  useEffect(() => {
    if (status !== 'ongoing') return;
    const currentOrderUnit = order[turnIndex];
    if (!currentOrderUnit) return;
    const live = units.find((u) => u.uid === currentOrderUnit.uid);
    if (!live || !live.alive) {
      advanceTurn(units);
      return;
    }
    if (live.isPlayer) {
      setActionPhase('choose');
    } else {
      setActionPhase('idle');
      const timeout = setTimeout(() => {
        const targets = units.filter((u) => u.isPlayer && u.alive);
        const target = pickTarget(targets);
        if (!target) return;
        const useSkill = live.skillCooldownRemaining === 0;
        executeAction(live, target, useSkill ? 'skill' : 'attack');
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [turnIndex, round, status]);

  // Reward / XP on victory
  useEffect(() => {
    if (status === 'won' && !rewardClaimed) {
      completeStage(stage.id, true, stage.goldReward);
      gainXp(activeTeamIds, Math.floor(stage.goldReward / 2));
      setRewardClaimed(true);
    }
  }, [status, rewardClaimed]);

  const currentActor = order[turnIndex] ? units.find((u) => u.uid === order[turnIndex].uid) : null;
  const isPlayerTurn = Boolean(status === 'ongoing' && currentActor?.isPlayer && currentActor?.alive);
  const hasItems = Object.values(items).some((c) => c > 0);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div>
          <span className="font-bold text-amber-200">{stage.name}</span>
          <span className="ml-2 text-sm text-slate-500">· Round {round}</span>
        </div>
        <button
          onClick={() => setStatus('lost')}
          className="rounded-lg border border-red-800/50 bg-red-950/50 px-3 py-1 text-sm text-red-400 transition hover:bg-red-900/60"
        >
          🏳 Forfeit
        </button>
      </div>

      {/* Arena */}
      <div
        className="relative flex items-end justify-between px-6 py-8 gap-4"
        style={{
          background: 'linear-gradient(to bottom, #1a3a5c 0%, #1a3a5c 28%, #4a8c30 28%, #3d7826 60%, #2d5c1a 100%)',
          minHeight: '230px',
        }}
      >
        {/* Ground line decoration */}
        <div className="absolute left-0 right-0 border-b border-black/20" style={{ bottom: '40%' }} />

        {/* Player team */}
        <div className="flex gap-3 z-10">
          {units.filter((u) => u.isPlayer).map((unit) => (
            <UnitSprite
              key={unit.uid}
              unit={unit}
              flashType={hitFlash?.uid === unit.uid ? hitFlash.type : null}
              glow={actionPhase === 'pick-ally' && unit.isPlayer && unit.alive ? 'green' : null}
              onClick={() => handleAllyClick(unit)}
            />
          ))}
        </div>

        {/* VS */}
        <div className="text-white/20 text-2xl font-black select-none z-10">VS</div>

        {/* Enemy team */}
        <div className="flex gap-3 z-10">
          {units.filter((u) => !u.isPlayer).map((unit) => (
            <UnitSprite
              key={unit.uid}
              unit={unit}
              flashType={hitFlash?.uid === unit.uid ? hitFlash.type : null}
              glow={actionPhase === 'pick-enemy' && !unit.isPlayer && unit.alive ? 'red' : null}
              onClick={() => handleEnemyClick(unit)}
            />
          ))}
        </div>

        {/* Current turn label */}
        {status === 'ongoing' && currentActor && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white/60 bg-black/40 px-2 py-0.5 rounded-full">
            {currentActor.alive ? `${currentActor.character.name.split(' ')[0]}'s turn` : 'Resolving…'}
          </div>
        )}
      </div>

      {/* Action area */}
      <div className="flex flex-col gap-3 px-4 py-3">
        {status === 'ongoing' && actionPhase === 'choose' && currentActor && (
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              className="rounded-xl border border-red-700/60 bg-red-950/60 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-900/70"
              onClick={() => { setPendingAction('attack'); setActionPhase('pick-enemy'); }}
            >
              ⚔️ Attack
            </button>
            <button
              disabled={currentActor.skillCooldownRemaining > 0}
              className="rounded-xl border border-purple-700/60 bg-purple-950/60 px-4 py-2 text-sm font-bold text-purple-200 transition hover:bg-purple-900/70 disabled:opacity-40"
              onClick={() => { setPendingAction('skill'); setActionPhase('pick-enemy'); }}
            >
              ✨ {currentActor.character.skill.name}
              {currentActor.skillCooldownRemaining > 0 ? ` (${currentActor.skillCooldownRemaining})` : ''}
            </button>
            {hasItems && (
              <button
                className="rounded-xl border border-green-700/60 bg-green-950/60 px-4 py-2 text-sm font-bold text-green-200 transition hover:bg-green-900/70"
                onClick={() => setActionPhase('pick-item')}
              >
                🧪 Item
              </button>
            )}
          </div>
        )}

        {status === 'ongoing' && actionPhase === 'pick-enemy' && (
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-red-300 animate-pulse">← Select a target →</span>
            <button className="btn-secondary text-xs" onClick={() => { setActionPhase('choose'); setPendingAction(null); }}>Cancel</button>
          </div>
        )}

        {status === 'ongoing' && actionPhase === 'pick-ally' && (
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-green-300 animate-pulse">← Select an ally →</span>
            <button className="btn-secondary text-xs" onClick={() => { setActionPhase('choose'); setPendingItem(null); }}>Cancel</button>
          </div>
        )}

        {status === 'ongoing' && actionPhase === 'pick-item' && (
          <div className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-800/90 p-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Use Item</div>
            {Object.entries(items)
              .filter(([, count]) => count > 0)
              .map(([itemId, count]) => {
                const def = ITEM_DEFS[itemId];
                if (!def) return null;
                return (
                  <button
                    key={itemId}
                    className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm transition hover:bg-slate-600"
                    onClick={() => { setPendingItem(itemId); setActionPhase('pick-ally'); }}
                  >
                    <span>{def.emoji}</span>
                    <span className="font-semibold">{def.name}</span>
                    <span className="ml-auto text-xs text-slate-400">{def.desc}</span>
                    <span className="text-xs text-slate-500">×{count}</span>
                  </button>
                );
              })}
            <button className="btn-secondary text-xs self-start" onClick={() => setActionPhase('choose')}>Cancel</button>
          </div>
        )}

        {status === 'won' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="text-2xl font-black text-green-400">Victory!</div>
            <div className="text-yellow-300">🪙 +{stage.goldReward} coins · ✨ +{Math.floor(stage.goldReward / 2)} XP</div>
            <button className="btn" onClick={onExit}>Continue</button>
          </div>
        )}
        {status === 'lost' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="text-2xl font-black text-red-400">Defeated</div>
            <button className="btn" onClick={onExit}>Retreat</button>
          </div>
        )}
      </div>

      {/* Battle log */}
      <div className="mx-4 mb-4 flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">Battle Log</div>
        {log.map((entry, i) => (
          <div key={i} className="text-xs text-slate-400 leading-relaxed">{entry}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Unit sprite in the arena ───────────────────────────────────────────────

function UnitSprite({
  unit,
  flashType,
  glow,
  onClick,
}: {
  unit: BattleUnit;
  flashType: 'phys' | 'magic' | 'heal' | null;
  glow: 'red' | 'green' | null;
  onClick: () => void;
}) {
  const hpPct = Math.max(0, (unit.currentHp / unit.maxHp) * 100);

  let ringClass = '';
  if (flashType === 'phys') ringClass = 'ring-4 ring-red-500';
  else if (flashType === 'magic') ringClass = 'ring-4 ring-purple-500';
  else if (flashType === 'heal') ringClass = 'ring-4 ring-green-400';
  else if (glow === 'red') ringClass = 'ring-2 ring-red-400 animate-pulse cursor-crosshair';
  else if (glow === 'green') ringClass = 'ring-2 ring-green-400 animate-pulse cursor-pointer';

  return (
    <div
      onClick={glow ? onClick : undefined}
      className={`flex flex-col items-center gap-1 ${!unit.alive ? 'opacity-30 grayscale' : ''} transition-all duration-150`}
    >
      {/* Portrait */}
      <div className={`relative h-16 w-16 overflow-hidden rounded-full border-2 transition-all duration-150 ${unit.alive ? 'border-slate-500' : 'border-slate-800'} ${ringClass}`}>
        {unit.character.image ? (
          <img
            src={unit.character.image}
            alt={unit.character.name}
            className="h-full w-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-700 text-2xl font-black text-slate-300">
            {unit.character.name.charAt(0)}
          </div>
        )}
        {!unit.alive && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-2xl">💀</div>
        )}
      </div>
      {/* Name */}
      <div className="max-w-[68px] truncate text-center text-[9px] font-semibold text-white">
        {unit.character.name.split(' ')[0]}
      </div>
      {/* HP bar */}
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/50">
        <div
          className={`h-full rounded-full transition-all duration-300 ${hpPct > 50 ? 'bg-green-400' : hpPct > 25 ? 'bg-yellow-400' : 'bg-red-500'}`}
          style={{ width: `${hpPct}%` }}
        />
      </div>
      <div className="text-[8px] text-white/60">{unit.currentHp}/{unit.maxHp}</div>
    </div>
  );
}
