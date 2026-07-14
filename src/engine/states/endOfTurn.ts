import { resetActionGauge } from "../formulas/actionGauge";
import { tickStatusEffects } from "../formulas/statusEffects";
import type { AnimationEvent } from "../types";
import { updateEntity, type BattleState } from "./battleState";

export interface EndOfTurnResult {
  state: BattleState;
  events: AnimationEvent[];
}

/**
 * Phase 4 — End of Turn:
 * Decrement buff/debuff durations, reset actor gauge to 0%.
 */
export function processEndOfTurn(
  state: BattleState,
  actorId: string
): EndOfTurnResult {
  const events: AnimationEvent[] = [{ type: "turn_end", actorId }];

  const nextState = updateEntity(state, actorId, (entity) => ({
    ...entity,
    statusEffects: tickStatusEffects(entity.statusEffects),
    actionGauge: resetActionGauge(),
  }));

  return {
    state: {
      ...nextState,
      turnNumber: nextState.turnNumber + 1,
    },
    events,
  };
}
