import { resetActionGauge } from "../formulas/actionGauge";
import { tickSkillCooldowns } from "../skills";
import { tickStatusEffects } from "../formulas/statusEffects";
import type { AnimationEvent, StatusEffect } from "../types";
import { isDot, isCrowdControl, isStatModifier } from "../types";
import { updateEntity, type BattleState } from "./battleState";

function collectExpiredEvents(
  actorId: string,
  before: StatusEffect[],
  after: StatusEffect[]
): AnimationEvent[] {
  const events: AnimationEvent[] = [];
  const afterTypes = new Set(after.map((e) => e.type));

  for (const effect of before) {
    if (afterTypes.has(effect.type)) continue;

    if (isDot(effect.type) || isCrowdControl(effect.type)) {
      events.push({
        type: "debuff_expire",
        actorId,
        metadata: { effectType: effect.type },
      });
    } else if (isStatModifier(effect.type)) {
      events.push({
        type: effect.type.includes("buff") ? "buff_expire" : "debuff_expire",
        actorId,
        metadata: { effectType: effect.type },
      });
    }
  }

  return events;
}

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

  const actor = state.entities.find((e) => e.id === actorId);
  const priorEffects = actor?.statusEffects ?? [];
  const tickedEffects = tickStatusEffects(priorEffects);
  const expireEvents = collectExpiredEvents(actorId, priorEffects, tickedEffects);
  events.push(...expireEvents);

  const nextState = updateEntity(state, actorId, (entity) => ({
    ...entity,
    statusEffects: tickedEffects,
    skillCooldowns: tickSkillCooldowns(entity.skillCooldowns),
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
