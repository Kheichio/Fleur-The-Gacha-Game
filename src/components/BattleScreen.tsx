import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTER_POOL } from '../data/characters';
import { STAGES } from '../data/stages';
import { ENCOUNTERS } from '../data/encounters';
import type { BattleUnit } from '../types';
import { buildTurnOrder, calcDamage, pickTarget, toBattleUnit } from '../systems/battle';

interface Props {
  stageId: string;
  onExit: () => void;
}

type Status = 'ongoing' | 'won' | 'lost';

export default function BattleScreen({ stageId, onExit }: Props) {
  const activeTeamIds = useGameStore((s) => s.activeTeamIds);
  const completeStage = useGameStore((s) => s.completeStage);
  const stage = useMemo(() => [...STAGES, ...ENCOUNTERS].find((s) => s.id === stageId)!, [stageId]);

  const [units, setUnits] = useState<BattleUnit[]>(() => {
    const playerUnits = activeTeamIds
      .map((id) => CHARACTER_POOL.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => toBattleUnit(c, true));
    const enemyUnits = stage.enemyTeam.map((c) => toBattleUnit(c, false));
    return [...playerUnits, ...enemyUnits];
  });
  const [order, setOrder] = useState<BattleUnit[]>(() => buildTurnOrder(units));
  const [turnIndex, setTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [log, setLog] = useState<string[]>([`${stage.name} — Round 1 begins!`]);
  const [status, setStatus] = useState<Status>('ongoing');
  const [rewardClaimed, setRewardClaimed] = useState(false);

  function appendLog(text: string) {
    setLog((l) => [...l.slice(-30), text]);
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
    const playerAlive = updated.some((u) => u.isPlayer && u.alive);
    const enemyAlive = updated.some((u) => !u.isPlayer && u.alive);
    if (!enemyAlive) return 'won';
    if (!playerAlive) return 'lost';
    return 'ongoing';
  }

  function performAction(actor: BattleUnit, type: 'attack' | 'skill') {
    const opponents = units.filter((u) => u.isPlayer !== actor.isPlayer);
    const target = pickTarget(opponents);
    if (!target) return;

    const useSkill = type === 'skill' && actor.skillCooldownRemaining === 0;
    const multiplier = useSkill ? actor.character.skill.multiplier : 1;
    const damage = calcDamage(actor, target, multiplier);
    let updated = applyDamage(units, target.uid, damage);
    if (useSkill) {
      updated = updated.map((u) =>
        u.uid === actor.uid ? { ...u, skillCooldownRemaining: actor.character.skill.cooldown } : u
      );
    }

    const defeated = damage >= target.currentHp;
    appendLog(
      `${actor.character.name} ${useSkill ? `uses ${actor.character.skill.name} on` : 'attacks'} ${
        target.character.name
      } for ${damage} dmg${defeated ? ' — defeated!' : '.'}`
    );

    const outcome = checkOutcome(updated);
    setStatus(outcome);
    if (outcome === 'ongoing') {
      advanceTurn(updated);
    } else {
      setUnits(updated);
    }
  }

  useEffect(() => {
    if (status !== 'ongoing') return;
    const currentOrderUnit = order[turnIndex];
    if (!currentOrderUnit) return;
    const live = units.find((u) => u.uid === currentOrderUnit.uid);
    if (!live || !live.alive) {
      advanceTurn(units);
      return;
    }
    if (!live.isPlayer) {
      const timeout = setTimeout(() => {
        const useSkill = live.skillCooldownRemaining === 0;
        performAction(live, useSkill ? 'skill' : 'attack');
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [turnIndex, round, status]);

  useEffect(() => {
    if (status === 'won' && !rewardClaimed) {
      completeStage(stage.id, true, stage.goldReward);
      setRewardClaimed(true);
    }
  }, [status, rewardClaimed, completeStage, stage]);

  const currentOrderUnit = order[turnIndex];
  const liveCurrentUnit = currentOrderUnit && units.find((u) => u.uid === currentOrderUnit.uid);
  const isPlayerTurn = Boolean(status === 'ongoing' && liveCurrentUnit?.isPlayer && liveCurrentUnit?.alive);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h2 className="text-xl font-bold">
        {stage.name} — Round {round}
      </h2>
      <div className="flex w-full max-w-3xl justify-between gap-8">
        <TeamPanel title="Your Team" units={units.filter((u) => u.isPlayer)} />
        <TeamPanel title="Enemies" units={units.filter((u) => !u.isPlayer)} />
      </div>

      {status === 'ongoing' && liveCurrentUnit && (
        <div className="text-sm opacity-80">
          {liveCurrentUnit.alive ? `${liveCurrentUnit.character.name}'s turn` : 'Resolving...'}
        </div>
      )}

      {isPlayerTurn && liveCurrentUnit && (
        <div className="flex gap-3">
          <button className="btn" onClick={() => performAction(liveCurrentUnit, 'attack')}>
            Attack
          </button>
          <button
            className="btn"
            disabled={liveCurrentUnit.skillCooldownRemaining > 0}
            onClick={() => performAction(liveCurrentUnit, 'skill')}
          >
            {liveCurrentUnit.character.skill.name}
            {liveCurrentUnit.skillCooldownRemaining > 0 ? ` (${liveCurrentUnit.skillCooldownRemaining})` : ''}
          </button>
        </div>
      )}

      {status === 'won' && (
        <div className="flex flex-col items-center gap-3">
          <div className="text-2xl text-green-400">Victory! 🪙 +{stage.goldReward} coins</div>
          <button className="btn" onClick={onExit}>
            Continue
          </button>
        </div>
      )}
      {status === 'lost' && (
        <div className="flex flex-col items-center gap-3">
          <div className="text-2xl text-red-400">Defeat...</div>
          <button className="btn" onClick={onExit}>
            Retreat
          </button>
        </div>
      )}

      <div className="flex h-40 w-full max-w-3xl flex-col gap-1 overflow-y-auto rounded bg-slate-900/60 p-3 text-xs">
        {log.map((entry, i) => (
          <div key={i}>{entry}</div>
        ))}
      </div>
    </div>
  );
}

function TeamPanel({ title, units }: { title: string; units: BattleUnit[] }) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="font-semibold">{title}</div>
      {units.map((u) => (
        <div
          key={u.uid}
          className={`rounded border p-2 ${u.alive ? 'border-slate-600' : 'border-slate-800 opacity-40'}`}
        >
          <div className="text-sm">{u.character.name}</div>
          <div className="h-2 w-full rounded bg-slate-700">
            <div
              className="h-2 rounded bg-green-500"
              style={{ width: `${Math.max(0, (u.currentHp / u.maxHp) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] opacity-70">
            {u.currentHp}/{u.maxHp} HP
          </div>
        </div>
      ))}
    </div>
  );
}
