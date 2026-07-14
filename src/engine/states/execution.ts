import { resolveAttackWithModifiers } from "../formulas/attackResolution";
import type { AnimationEvent } from "../types";
import {
  checkBattleOutcome,
  findEntity,
  updateEntity,
  type BattleAction,
  type BattleState,
} from "./battleState";

export interface ExecutionResult {
  state: BattleState;
  events: AnimationEvent[];
}

/**
 * Phase 3 — Execution:
 * Hit → Crit → DEF reduction → apply damage to target HP.
 */
export function processExecution(
  state: BattleState,
  actorId: string,
  action: BattleAction,
  rng: () => number = Math.random
): ExecutionResult {
  const events: AnimationEvent[] = [];
  const actor = findEntity(state, actorId);
  const target = findEntity(state, action.targetId);

  if (!actor || !target) {
    return { state, events };
  }

  events.push({
    type: "attack",
    actorId,
    targetId: action.targetId,
    metadata: action.skillId ? { skillId: action.skillId } : undefined,
  });

  const result = resolveAttackWithModifiers(
    {
      baseStats: {
        atk: actor.stats.atk,
        def: actor.stats.def,
        accuracy: actor.stats.accuracy,
        evasion: actor.stats.evasion,
        critChance: actor.stats.critChance,
        critDamage: actor.stats.critDamage,
        critResist: actor.stats.critResist,
      },
      statusEffects: actor.statusEffects,
    },
    {
      baseStats: {
        atk: target.stats.atk,
        def: target.stats.def,
        accuracy: target.stats.accuracy,
        evasion: target.stats.evasion,
        critChance: target.stats.critChance,
        critDamage: target.stats.critDamage,
        critResist: target.stats.critResist,
      },
      statusEffects: target.statusEffects,
    },
    rng
  );

  if (!result.hit) {
    events.push({ type: "miss", actorId, targetId: action.targetId });
    return { state, events };
  }

  if (result.isCritical) {
    events.push({
      type: "critical",
      actorId,
      targetId: action.targetId,
      value: result.damage,
    });
  }

  events.push({
    type: "damage",
    actorId,
    targetId: action.targetId,
    value: result.damage,
  });

  let nextState = updateEntity(state, action.targetId, (entity) => ({
    ...entity,
    stats: {
      ...entity.stats,
      hp: Math.max(0, entity.stats.hp - result.damage),
    },
  }));

  nextState = checkBattleOutcome(nextState);
  return { state: nextState, events };
}
