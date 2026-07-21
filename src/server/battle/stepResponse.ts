import { randomUUID } from "node:crypto";
import type { AnimationEvent } from "../../types";
import { updateSession } from "./sessionStore";
import type { BattleSession, BattleStepResponse } from "./types";

export function buildAnimationQueue(
  session: BattleSession,
  events: AnimationEvent[]
): BattleStepResponse["animationQueue"] {
  return {
    events,
    finalState: {
      entities: session.state.entities,
      floor: session.state.floor,
      turnNumber: session.state.turnNumber,
      isComplete: session.state.isComplete,
      result: session.state.result,
    },
  };
}

export function toStepResponse(
  session: BattleSession,
  events: AnimationEvent[]
): BattleStepResponse {
  return {
    sessionId: session.id,
    state: session.state,
    events,
    animationQueue: buildAnimationQueue(session, events),
    actionRequired: Boolean(session.waitingActorId),
    waitingActorId: session.waitingActorId,
    turnNonce: session.turnNonce,
    rewards: session.rewards,
  };
}

export function rotateTurnNonce(session: BattleSession): BattleSession {
  return updateSession(session.id, { turnNonce: randomUUID() }) ?? session;
}

export function applyAdvanceResult(
  session: BattleSession,
  result: {
    state: BattleSession["state"];
    waitingActorId?: string;
    actionRequired: boolean;
    turnResult?: { events: AnimationEvent[] };
  }
): BattleSession {
  const updated =
    updateSession(session.id, {
      state: result.state,
      waitingActorId: result.waitingActorId,
      priorEvents: result.actionRequired
        ? result.turnResult?.events
        : undefined,
    }) ?? session;

  return rotateTurnNonce(updated);
}
