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
  area?: string;
  onExit: () => void;
}

type Status = 'ongoing' | 'won' | 'lost';
type ActionPhase = 'idle' | 'choose' | 'pick-enemy' | 'pick-item' | 'pick-ally';
type PendingAction = 'phys-attack' | 'magic-attack' | 'skill' | null;

const AREA_BACKGROUNDS: Record<string, string> = {
  meadow:     'linear-gradient(180deg, #4a90c8 0%, #6aabe0 20%, #6aabe0 30%, #7db844 30%, #5a9a30 55%, #3d7820 80%, #2a5c16 100%)',
  forest:     'linear-gradient(180deg, #1a3a28 0%, #1e4a30 15%, #1a3a28 30%, #2d5c1a 30%, #1e4a14 55%, #142e0e 80%, #0d1f08 100%)',
  crossroads: 'linear-gradient(180deg, #3a3020 0%, #5a4830 20%, #4a3c28 30%, #8a7a50 30%, #6a5c3a 55%, #4a3e28 80%, #2a2418 100%)',
  ruins:      'linear-gradient(180deg, #2a1a2a 0%, #3a2030 20%, #281828 30%, #4a4050 30%, #3a3040 55%, #2a2030 80%, #1a1020 100%)',
  spire:      'linear-gradient(180deg, #0a0a1a 0%, #151530 15%, #1a1a3a 30%, #2a2a3a 30%, #1e1e2e 55%, #141420 80%, #0a0a14 100%)',
  bastion:    'linear-gradient(180deg, #2a1a0a 0%, #3a2810 20%, #2a1a0a 30%, #5a4a30 30%, #4a3c28 55%, #3a2e1e 80%, #201a10 100%)',
  gate:       'linear-gradient(180deg, #1a0808 0%, #2a1010 15%, #1a0808 30%, #3a2020 30%, #2a1818 55%, #1a1010 80%, #0a0404 100%)',
  town:       'linear-gradient(180deg, #4a7ac8 0%, #5a90d0 20%, #5a90d0 30%, #8a7a60 30%, #7a6a50 55%, #6a5a40 80%, #4a3e30 100%)',
  default:    'linear-gradient(180deg, #0f2840 0%, #1a3a5c 20%, #1a3a5c 35%, #3a7a28 35%, #2d6420 55%, #1e4a14 75%, #142e0e 100%)',
};

const STAGE_AREA_MAP: Record<string, string> = {
  'stage-1': 'meadow',
  'stage-2': 'forest',
  'stage-3': 'ruins',
  'stage-4': 'spire',
  'stage-5': 'gate',
  'enc-wolves': 'forest',
  'enc-bandits': 'crossroads',
  'enc-mercenaries': 'bastion',
  'town-bandits': 'town',
};

export default function BattleScreen({ stageId, area, onExit }: Props) {
  const activeTeamIds = useGameStore((s) => s.activeTeamIds);
  const characterData = useGameStore((s) => s.characterData);
  const storedHp = useGameStore((s) => s.currentHp) ?? {};
  const completeStage = useGameStore((s) => s.completeStage);
  const gainXp = useGameStore((s) => s.gainXp);
  const updateHp = useGameStore((s) => s.updateHp);
  const items = useGameStore((s) => s.items);
  const spendItem = useGameStore((s) => s.spendItem);
  const recordDefeats = useGameStore((s) => s.recordDefeats);

  const stage = useMemo(() => [...STAGES, ...ENCOUNTERS].find((s) => s.id === stageId)!, [stageId]);
  const bgArea = area ?? STAGE_AREA_MAP[stageId] ?? 'default';
  const bgGradient = AREA_BACKGROUNDS[bgArea] ?? AREA_BACKGROUNDS.default;

  const initialUnits = useMemo(() => {
    const playerUnits = activeTeamIds
      .map((id) => CHARACTER_POOL.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => {
        const d = characterData[c.id] ?? { level: 1, xp: 0, enhancement: 0 };
        const stats = effectiveStats(c.stats, d.level, d.enhancement);
        const unit = toBattleUnit({ ...c, stats }, true);
        const saved = storedHp[c.id];
        if (saved !== undefined && saved >= 0) {
          const hp = Math.min(saved, unit.maxHp);
          return { ...unit, currentHp: hp, alive: hp > 0 };
        }
        return unit;
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
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [hitFlash, setHitFlash] = useState<{ uid: string; type: 'phys' | 'magic' | 'heal' } | null>(null);
  const [damagePopup, setDamagePopup] = useState<{ uid: string; amount: number; isCrit: boolean } | null>(null);

  function appendLog(text: string) {
    setLog((l) => [...l.slice(-30), text]);
  }

  function flashUnit(uid: string, type: 'phys' | 'magic' | 'heal') {
    setHitFlash({ uid, type });
    setTimeout(() => setHitFlash((prev) => (prev?.uid === uid ? null : prev)), 360);
  }

  function showDamage(uid: string, amount: number, isCrit: boolean) {
    setDamagePopup({ uid, amount, isCrit });
    setTimeout(() => setDamagePopup((prev) => (prev?.uid === uid ? null : prev)), 900);
  }

  function saveHpToStore(currentUnits: BattleUnit[]) {
    const hpMap: Record<string, number> = {};
    for (const u of currentUnits) {
      if (u.isPlayer) {
        hpMap[u.character.id] = u.currentHp;
      }
    }
    updateHp(hpMap);
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
    appendLog(`— Round ${round + 1} —`);
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

  function executeAction(actor: BattleUnit, target: BattleUnit, type: PendingAction) {
    const useSkill = type === 'skill' && actor.skillCooldownRemaining === 0;
    const skillType = actor.character.skill.type ?? 'melee';
    let multiplier = 1;
    let attackType: 'melee' | 'magic' = 'melee';
    let actionLabel = '';

    if (useSkill) {
      multiplier = actor.character.skill.multiplier;
      attackType = skillType;
      actionLabel = `uses ${actor.character.skill.name} on`;
    } else if (type === 'magic-attack') {
      attackType = 'magic';
      actionLabel = 'casts magic at';
    } else {
      attackType = 'melee';
      actionLabel = 'strikes';
    }

    const damage = calcDamage(actor, target, multiplier, attackType);
    const baseDmg = Math.max(1, Math.round(
      (attackType === 'magic' ? actor.character.stats.magAtk : actor.character.stats.physAtk) * multiplier
      - (attackType === 'magic' ? target.character.stats.magDef : target.character.stats.physDef) * 0.5
    ));
    const isCrit = damage > baseDmg;

    if (attackType === 'magic') {
      playMagicHit();
      flashUnit(target.uid, 'magic');
    } else {
      playMeleeHit();
      flashUnit(target.uid, 'phys');
    }
    showDamage(target.uid, damage, isCrit);

    let updated = applyDamage(units, target.uid, damage);
    if (useSkill) {
      updated = updated.map((u) =>
        u.uid === actor.uid ? { ...u, skillCooldownRemaining: actor.character.skill.cooldown } : u
      );
    }

    const defeated = damage >= target.currentHp;
    appendLog(
      `${actor.character.name} ${actionLabel} ${target.character.name} for ${damage}${isCrit ? ' CRIT!' : ''}${defeated ? ' — defeated!' : '.'}`
    );

    const outcome = checkOutcome(updated);
    setStatus(outcome);
    setActionPhase('idle');
    setPendingAction(null);
    if (outcome === 'ongoing') {
      advanceTurn(updated);
    } else {
      setUnits(updated);
      saveHpToStore(updated);
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
    showDamage(ally.uid, -healed, false);
    spendItem(pendingItem);
    appendLog(`${actor.character.name} uses ${def.emoji} ${def.name} on ${ally.character.name} (+${healed} HP).`);
    setUnits(updated);
    setPendingItem(null);
    setActionPhase('idle');
    advanceTurn(updated);
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
    if (live.isPlayer) {
      setActionPhase('choose');
    } else {
      setActionPhase('idle');
      const timeout = setTimeout(() => {
        const targets = units.filter((u) => u.isPlayer && u.alive);
        const target = pickTarget(targets);
        if (!target) return;
        const useSkill = live.skillCooldownRemaining === 0;
        if (useSkill) {
          executeAction(live, target, 'skill');
        } else {
          const useMagic = live.character.stats.magAtk > live.character.stats.physAtk;
          executeAction(live, target, useMagic ? 'magic-attack' : 'phys-attack');
        }
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [turnIndex, round, status]);

  useEffect(() => {
    if ((status === 'won' || status === 'lost') && !rewardClaimed) {
      const monstersKilled = units.filter((u) => !u.isPlayer && !u.alive).length;
      const alliesLost = units.filter((u) => u.isPlayer && !u.alive).length;
      recordDefeats(monstersKilled, alliesLost);
      if (status === 'won') {
        completeStage(stage.id, true, stage.goldReward);
        gainXp(activeTeamIds, Math.floor(stage.goldReward / 2));
      }
      setRewardClaimed(true);
    }
  }, [status, rewardClaimed]);

  const currentActor = order[turnIndex] ? units.find((u) => u.uid === order[turnIndex].uid) : null;
  const hasItems = Object.values(items).some((c) => c > 0);

  return (
    <div className="flex h-screen flex-col bg-[#070d1a] text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-slate-800/60 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "'Cinzel', Georgia, serif" }} className="text-lg font-bold text-amber-200">
            {stage.name}
          </span>
          <span className="rounded-full bg-slate-800/60 px-2.5 py-0.5 text-xs font-semibold text-slate-400">Round {round}</span>
        </div>
        <button
          onClick={() => { saveHpToStore(units); setStatus('lost'); }}
          className="rounded-lg border border-red-800/50 bg-red-950/50 px-4 py-1.5 text-sm font-semibold text-red-400 transition hover:bg-red-900/60"
        >
          Forfeit
        </button>
      </div>

      {/* Arena */}
      <div
        className="relative flex-1 flex items-center justify-center gap-12 px-8 overflow-hidden"
        style={{ background: bgGradient }}
      >
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 20%, rgba(100,180,255,0.04) 0%, transparent 60%)',
        }} />
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-1/3" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.25), transparent)',
        }} />

        {/* Player team */}
        <div className="flex items-end gap-5 z-10">
          {units.filter((u) => u.isPlayer).map((unit) => (
            <UnitSprite
              key={unit.uid}
              unit={unit}
              flashType={hitFlash?.uid === unit.uid ? hitFlash.type : null}
              glow={actionPhase === 'pick-ally' && unit.isPlayer && unit.alive ? 'green' : null}
              isCurrentActor={currentActor?.uid === unit.uid && status === 'ongoing'}
              onClick={() => handleAllyClick(unit)}
              damagePopup={damagePopup?.uid === unit.uid ? damagePopup : null}
            />
          ))}
        </div>

        <div className="z-10 flex flex-col items-center gap-1 mb-6">
          <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="text-white/10 text-2xl font-black select-none">VS</div>
          <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>

        {/* Enemy team */}
        <div className="flex items-end gap-5 z-10">
          {units.filter((u) => !u.isPlayer).map((unit) => (
            <UnitSprite
              key={unit.uid}
              unit={unit}
              flashType={hitFlash?.uid === unit.uid ? hitFlash.type : null}
              glow={actionPhase === 'pick-enemy' && !unit.isPlayer && unit.alive ? 'red' : null}
              isCurrentActor={currentActor?.uid === unit.uid && status === 'ongoing'}
              onClick={() => handleEnemyClick(unit)}
              damagePopup={damagePopup?.uid === unit.uid ? damagePopup : null}
            />
          ))}
        </div>

        {status === 'ongoing' && currentActor && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1 text-xs text-white/60 backdrop-blur-sm">
            {currentActor.alive ? `${currentActor.character.name.split(' ')[0]}'s turn` : 'Resolving…'}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex-shrink-0 border-t border-slate-800/60 bg-slate-950/90 px-5 py-3">
        {status === 'ongoing' && actionPhase === 'choose' && currentActor && (
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              className="flex items-center gap-2 rounded-xl border border-red-700/60 bg-red-950/60 px-5 py-2.5 text-sm font-bold text-red-200 transition hover:bg-red-900/70"
              onClick={() => { setPendingAction('phys-attack'); setActionPhase('pick-enemy'); }}
            >
              <span className="text-lg">⚔️</span>
              <div className="text-left">
                <div>Strike</div>
                <div className="text-[10px] font-normal text-red-400/60">Physical · {currentActor.character.stats.physAtk} ATK</div>
              </div>
            </button>
            <button
              className="flex items-center gap-2 rounded-xl border border-blue-700/60 bg-blue-950/60 px-5 py-2.5 text-sm font-bold text-blue-200 transition hover:bg-blue-900/70"
              onClick={() => { setPendingAction('magic-attack'); setActionPhase('pick-enemy'); }}
            >
              <span className="text-lg">🔮</span>
              <div className="text-left">
                <div>Magic</div>
                <div className="text-[10px] font-normal text-blue-400/60">Magical · {currentActor.character.stats.magAtk} ATK</div>
              </div>
            </button>
            <button
              disabled={currentActor.skillCooldownRemaining > 0}
              className="flex items-center gap-2 rounded-xl border border-purple-700/60 bg-purple-950/60 px-5 py-2.5 text-sm font-bold text-purple-200 transition hover:bg-purple-900/70 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => { setPendingAction('skill'); setActionPhase('pick-enemy'); }}
            >
              <span className="text-lg">✨</span>
              <div className="text-left">
                <div>{currentActor.character.skill.name}</div>
                <div className="text-[10px] font-normal text-purple-400/60">
                  {currentActor.character.skill.type === 'magic' ? 'Magic' : 'Physical'} · {currentActor.character.skill.multiplier}x
                  {currentActor.skillCooldownRemaining > 0 ? ` · ${currentActor.skillCooldownRemaining} turns` : ''}
                </div>
              </div>
            </button>
            {hasItems && (
              <button
                className="flex items-center gap-2 rounded-xl border border-green-700/60 bg-green-950/60 px-5 py-2.5 text-sm font-bold text-green-200 transition hover:bg-green-900/70"
                onClick={() => setActionPhase('pick-item')}
              >
                <span className="text-lg">🧪</span>
                <div>Item</div>
              </button>
            )}
          </div>
        )}

        {status === 'ongoing' && actionPhase === 'pick-enemy' && (
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-red-300 animate-pulse">Select a target</span>
            <button className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-400 hover:text-white" onClick={() => { setActionPhase('choose'); setPendingAction(null); }}>Cancel</button>
          </div>
        )}

        {status === 'ongoing' && actionPhase === 'pick-ally' && (
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-green-300 animate-pulse">Select an ally</span>
            <button className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-400 hover:text-white" onClick={() => { setActionPhase('choose'); setPendingItem(null); }}>Cancel</button>
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
                    <span className="text-xs text-slate-500">x{count}</span>
                  </button>
                );
              })}
            <button className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-400 self-start hover:text-white" onClick={() => setActionPhase('choose')}>Cancel</button>
          </div>
        )}

        {status === 'won' && (
          <div className="flex flex-col items-center gap-3 py-3">
            <div style={{ fontFamily: "'Cinzel Decorative', Georgia, serif" }} className="text-3xl font-black text-green-400">Victory!</div>
            <div className="flex gap-4 text-sm">
              <span className="font-bold text-yellow-300">🪙 +{stage.goldReward}</span>
              <span className="font-bold text-blue-300">✨ +{Math.floor(stage.goldReward / 2)} XP</span>
            </div>
            <button className="btn" onClick={onExit}>Continue</button>
          </div>
        )}
        {status === 'lost' && (
          <div className="flex flex-col items-center gap-3 py-3">
            <div style={{ fontFamily: "'Cinzel Decorative', Georgia, serif" }} className="text-3xl font-black text-red-400">Defeated</div>
            <button className="btn" onClick={onExit}>Retreat</button>
          </div>
        )}

        {status === 'ongoing' && actionPhase === 'idle' && (
          <div className="text-center text-xs text-slate-700">Waiting...</div>
        )}
      </div>

      {/* Battle log */}
      <div className="flex-shrink-0 max-h-28 overflow-y-auto border-t border-slate-800/40 bg-slate-950/60 px-5 py-2">
        {log.slice(-8).map((entry, i) => (
          <div key={i} className={`text-xs leading-relaxed ${i === log.slice(-8).length - 1 ? 'text-slate-300' : 'text-slate-600'}`}>{entry}</div>
        ))}
      </div>
    </div>
  );
}

function UnitSprite({
  unit, flashType, glow, isCurrentActor, onClick, damagePopup,
}: {
  unit: BattleUnit;
  flashType: 'phys' | 'magic' | 'heal' | null;
  glow: 'red' | 'green' | null;
  isCurrentActor: boolean;
  onClick: () => void;
  damagePopup: { amount: number; isCrit: boolean } | null;
}) {
  const hpPct = Math.max(0, (unit.currentHp / unit.maxHp) * 100);

  let ringClass = '';
  if (flashType === 'phys') ringClass = 'ring-4 ring-red-500/80';
  else if (flashType === 'magic') ringClass = 'ring-4 ring-purple-500/80';
  else if (flashType === 'heal') ringClass = 'ring-4 ring-green-400/80';
  else if (glow === 'red') ringClass = 'ring-2 ring-red-400 animate-pulse cursor-crosshair';
  else if (glow === 'green') ringClass = 'ring-2 ring-green-400 animate-pulse cursor-pointer';
  else if (isCurrentActor && unit.alive) ringClass = 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/40';

  const shouldBounce = isCurrentActor && unit.isPlayer && unit.alive && !flashType;

  return (
    <div
      onClick={glow ? onClick : undefined}
      className={`relative flex flex-col items-center gap-1.5 ${!unit.alive ? 'opacity-25 grayscale' : ''} transition-all duration-150`}
    >
      {damagePopup && (
        <div className={`absolute -top-8 left-1/2 -translate-x-1/2 z-20 font-black text-lg animate-bounce ${
          damagePopup.amount < 0 ? 'text-green-400' : damagePopup.isCrit ? 'text-yellow-300' : 'text-red-400'
        }`} style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
          {damagePopup.amount < 0 ? `+${Math.abs(damagePopup.amount)}` : `-${damagePopup.amount}`}
          {damagePopup.isCrit && <span className="text-xs ml-0.5">CRIT</span>}
        </div>
      )}

      {isCurrentActor && unit.alive && (
        <div className={`text-xs leading-none mb-0.5 animate-pulse ${unit.isPlayer ? 'text-yellow-400' : 'text-red-400'}`}>▼</div>
      )}
      {(!isCurrentActor || !unit.alive) && (
        <div className="text-transparent text-xs leading-none mb-0.5">▼</div>
      )}

      <div className={`relative h-24 w-24 overflow-hidden rounded-2xl border-2 transition-all duration-150 ${
        unit.alive ? (unit.isPlayer ? 'border-blue-500/50' : 'border-red-500/50') : 'border-slate-800'
      } ${ringClass} ${shouldBounce ? 'animate-bounce' : ''}`}>
        {unit.character.image ? (
          <img src={unit.character.image} alt={unit.character.name} className="h-full w-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/characters/placeholder.svg'; }} />
        ) : (
          <div className={`flex h-full w-full items-center justify-center text-3xl font-black ${unit.isPlayer ? 'bg-blue-900/40 text-blue-300' : 'bg-red-900/40 text-red-300'}`}>
            {unit.character.name.charAt(0)}
          </div>
        )}
        {!unit.alive && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-2xl">💀</div>
        )}
      </div>

      <div className={`max-w-[96px] truncate text-center text-[11px] font-bold ${
        isCurrentActor && unit.alive ? (unit.isPlayer ? 'text-yellow-300' : 'text-red-300') : 'text-white/80'
      }`}>
        {unit.character.name.split(' ')[0]}
      </div>

      <div className="h-2 w-24 overflow-hidden rounded-full bg-black/60 border border-black/30">
        <div
          className={`h-full rounded-full transition-all duration-300 ${hpPct > 50 ? 'bg-green-400' : hpPct > 25 ? 'bg-yellow-400' : 'bg-red-500'}`}
          style={{ width: `${hpPct}%` }}
        />
      </div>
      <div className="text-[9px] text-white/50 font-mono">{unit.currentHp}/{unit.maxHp}</div>
    </div>
  );
}
