import { advanceBattleStep } from "../../engine/states";
import { applyAdvanceResult } from "./stepResponse";
import type { BattleSession } from "./types";

/** Resumes a paused manual turn when auto-battle is enabled. */
export function resolveWaitingAutoTurn(session: BattleSession): BattleSession {
  if (!session.waitingActorId || !session.state.autoBattle) {
    return session;
  }

  const result = advanceBattleStep(session.state, {
    actorId: session.waitingActorId,
    resumeFromActionChoice: true,
    priorEvents: session.priorEvents,
  });

  return applyAdvanceResult(session, result);
}
