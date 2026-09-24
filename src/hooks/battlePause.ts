import type { BattleStepResponse } from "../utils/api";

/** True when the player must pick a skill (manual mode). */
export function stepPausesForPlayer(step: BattleStepResponse): boolean {
  return Boolean(step.waitingActorId) && !step.state.autoBattle;
}
