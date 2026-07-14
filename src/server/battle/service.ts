import {
  advanceBattleStep,
  handlePlayerIntent,
} from "../../engine/states";
import type { AnimationEvent, PlayerIntent } from "../../engine/types";
import { getUserById, type DbPool } from "../db";
import { createBattleState } from "./factory";
import { grantBattleRewards } from "./rewards";
import {
  createSession,
  getSession,
  updateSession,
} from "./sessionStore";
import type { BattleSession, BattleStepResponse, StartBattleInput } from "./types";

const DEFAULT_MAX_STEPS = 20;

export class BattleServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "BattleServiceError";
  }
}

export async function startBattle(
  pool: DbPool,
  input: StartBattleInput
): Promise<BattleSession> {
  if (input.floor < 1 || input.floor > 100) {
    throw new BattleServiceError("Floor must be between 1 and 100", "INVALID_FLOOR");
  }

  const user = await getUserById(pool, input.userId);
  if (!user) {
    throw new BattleServiceError("User not found", "USER_NOT_FOUND", 404);
  }

  const state = createBattleState(input.floor, {
    autoBattle: input.autoBattle ?? true,
  });

  return createSession({
    userId: input.userId,
    floor: input.floor,
    state,
    rewardsGranted: false,
  });
}

export function getBattleSession(sessionId: string): BattleSession {
  const session = getSession(sessionId);
  if (!session) {
    throw new BattleServiceError("Battle session not found", "SESSION_NOT_FOUND", 404);
  }

  return session;
}

function toStepResponse(
  session: BattleSession,
  events: AnimationEvent[]
): BattleStepResponse {
  return {
    sessionId: session.id,
    state: session.state,
    events,
    actionRequired: Boolean(session.waitingActorId),
    waitingActorId: session.waitingActorId,
    rewards: session.rewards,
  };
}

async function finalizeWinRewards(
  pool: DbPool,
  session: BattleSession
): Promise<BattleSession> {
  if (session.rewardsGranted || session.state.result !== "win") {
    return session;
  }

  const rewards = await grantBattleRewards(
    pool,
    session.userId,
    session.id,
    session.floor
  );

  return (
    updateSession(session.id, {
      rewardsGranted: true,
      rewards,
      waitingActorId: undefined,
      priorEvents: undefined,
    }) ?? session
  );
}

function applyAdvanceResult(
  session: BattleSession,
  result: ReturnType<typeof advanceBattleStep>
): BattleSession {
  return (
    updateSession(session.id, {
      state: result.state,
      waitingActorId: result.waitingActorId,
      priorEvents: result.actionRequired
        ? result.turnResult?.events
        : undefined,
    }) ?? session
  );
}

export async function runBattleStep(
  pool: DbPool,
  sessionId: string,
  maxSteps: number = 1
): Promise<BattleStepResponse> {
  let session = getBattleSession(sessionId);
  const events: AnimationEvent[] = [];

  if (session.state.isComplete) {
    session = await finalizeWinRewards(pool, session);
    return toStepResponse(session, events);
  }

  const steps = Math.max(1, Math.min(maxSteps, DEFAULT_MAX_STEPS));

  for (let i = 0; i < steps; i++) {
    if (session.state.isComplete) break;

    if (session.waitingActorId && !session.state.autoBattle) {
      break;
    }

    const result = advanceBattleStep(session.state);
    session = applyAdvanceResult(session, result);

    if (result.payload) {
      events.push(...result.payload.events);
    }

    if (result.actionRequired) break;
    if (session.state.isComplete) break;
  }

  if (session.state.isComplete) {
    session = await finalizeWinRewards(pool, session);
  }

  return toStepResponse(session, events);
}

export async function submitBattleIntent(
  pool: DbPool,
  sessionId: string,
  intent: PlayerIntent
): Promise<BattleStepResponse> {
  let session = getBattleSession(sessionId);

  if (session.state.isComplete) {
    return toStepResponse(session, []);
  }

  const result = handlePlayerIntent(
    session.state,
    intent,
    session.waitingActorId,
    session.priorEvents
  );

  session = applyAdvanceResult(session, result);

  if (
    intent.type === "request_action" &&
    !result.actionRequired &&
    session.state.autoBattle
  ) {
    return runBattleStep(pool, sessionId, DEFAULT_MAX_STEPS);
  }

  if (session.state.isComplete) {
    session = await finalizeWinRewards(pool, session);
  }

  const events = result.payload?.events ?? result.turnResult?.events ?? [];
  return toStepResponse(session, events);
}

export async function runAutoBattle(
  pool: DbPool,
  sessionId: string
): Promise<BattleStepResponse> {
  let session = getBattleSession(sessionId);

  if (!session.state.autoBattle) {
    session =
      updateSession(session.id, {
        state: { ...session.state, autoBattle: true },
      }) ?? session;
  }

  return runBattleStep(pool, sessionId, DEFAULT_MAX_STEPS);
}
