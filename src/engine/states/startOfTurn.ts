import { calculateDotDamage, applyDotDamage } from "../formulas/dot";
import { resetActionGauge } from "../formulas/actionGauge";
import { isCrowdControl, isDot } from "../types";
import type { AnimationEvent } from "../types";
import {
  checkBattleOutcome,
  findEntity,
  updateEntity,
  type BattleState,
} from "./battleState";

export interface StartOfTurnResult {
  state: BattleState;
  events: AnimationEvent[];
  ccSkipped: boolean;
}

/**
 * Phase 1 — Start of Turn:
 * Apply DoT damage, then check CC. If CC active, skip the turn and reset gauge.
 */
export function processStartOfTurn(
  state: BattleState,
  actorId: string
): StartOfTurnResult {
  const events: AnimationEvent[] = [
    { type: "turn_start", actorId },
  ];

  const actor = findEntity(state, actorId);
  if (!actor) {
    return { state, events, ccSkipped: false };
  }

  let updatedActor = actor;

  for (const effect of updatedActor.statusEffects) {
    if (!isDot(effect.type)) continue;

    const dotDamage = calculateDotDamage(updatedActor.stats.maxHp);
    updatedActor = {
      ...updatedActor,
      stats: {
        ...updatedActor.stats,
        hp: applyDotDamage(updatedActor.stats.hp, dotDamage),
      },
    };

    events.push({
      type: "dot_damage",
      actorId,
      value: dotDamage,
      metadata: { effectType: effect.type },
    });
  }

  let nextState = updateEntity(state, actorId, () => updatedActor);
  nextState = checkBattleOutcome(nextState);

  if (nextState.isComplete) {
    return { state: nextState, events, ccSkipped: false };
  }

  const isCcActive = updatedActor.statusEffects.some(
    (effect) => isCrowdControl(effect.type) && effect.remainingTurns > 0
  );

  if (isCcActive) {
    events.push({ type: "cc_skip", actorId });
    nextState = updateEntity(state, actorId, (entity) => ({
      ...entity,
      stats: updatedActor.stats,
      actionGauge: resetActionGauge(),
    }));

    return { state: nextState, events, ccSkipped: true };
  }

  return { state: nextState, events, ccSkipped: false };
}
