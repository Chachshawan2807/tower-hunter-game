import { randomUUID } from "node:crypto";
import { advanceBattleStep, handlePlayerIntent } from "../../engine/states";
import type { AnimationEvent, PlayerIntent } from "../../types";
import { defaultSkillLoadout } from "../../engine/skills/loadout";
import {
  getPlayerLoadoutV2,
  getPlayerUpgrades,
  getPlayerSkillUnlocks,
  getUserById,
  type DbPool,
} from "../db";
import { getPlayerCombatStatsWithEquipment } from "../equipment/playerCombatStats";
import { createBattleState } from "./factory";
import { finalizeBattleOutcome } from "./finalization";
import { BattleServiceError, wrapValidationError } from "./errors";
import { validateBattleIntent } from "./intent";
import { getBattleSession } from "./sessionAccess";
import { createSession, updateSession } from "./sessionStore";
import { applyAdvanceResult, toStepResponse } from "./stepResponse";
import type { BattleSession, BattleStepResponse, StartBattleInput } from "./types";
import { BattleValidationError, validateBattleStart } from "./validation";

const DEFAULT_MAX_STEPS = 20;

export { BattleServiceError } from "./errors";
export { getBattleSession } from "./sessionAccess";

export async function startBattle(
  pool: DbPool,
  input: StartBattleInput
): Promise<BattleSession> {
  try {
    const statsRow = await validateBattleStart(pool, input.userId, input.floor);
    const user = await getUserById(pool, input.userId);

    if (!user) {
      throw new BattleServiceError("User not found", "USER_NOT_FOUND", 404);
    }

    const playerStats = await getPlayerCombatStatsWithEquipment(pool, statsRow);
    const playerSkillUpgrades = await getPlayerUpgrades(pool, input.userId);
    const playerUnlockedSkillIds = await getPlayerSkillUnlocks(
      pool,
      input.userId
    );
    const dbLoadout = await getPlayerLoadoutV2(pool, input.userId);
    const playerLoadout =
      dbLoadout ?? defaultSkillLoadout(playerUnlockedSkillIds);

    const state = createBattleState(input.floor, {
      autoBattle: input.autoBattle ?? true,
      playerStats,
      playerName: user.display_name,
      playerLoadout,
      playerSkillUpgrades,
      playerUnlockedSkillIds,
    });

    return createSession({
      userId: input.userId,
      floor: input.floor,
      state,
      turnNonce: randomUUID(),
      rewardsGranted: false,
      outcomeProcessed: false,
    });
  } catch (err) {
    wrapValidationError(err, BattleValidationError);
  }
}

export async function runBattleStep(
  pool: DbPool,
  sessionId: string,
  maxSteps: number = 1
): Promise<BattleStepResponse> {
  let session = getBattleSession(sessionId);
  const events: AnimationEvent[] = [];

  if (session.state.isComplete) {
    session = await finalizeBattleOutcome(pool, session);
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
    session = await finalizeBattleOutcome(pool, session);
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

  try {
    validateBattleIntent(session, intent);
  } catch (err) {
    if (err instanceof BattleServiceError) throw err;
    wrapValidationError(err, BattleValidationError);
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
    session = await finalizeBattleOutcome(pool, session);
  }

  const events = result.payload?.events ?? result.turnResult?.events ?? [];
  return toStepResponse(session, events);
}

export async function runAutoBattle(
  pool: DbPool,
  sessionId: string
): Promise<BattleStepResponse> {
  const session = getBattleSession(sessionId);

  if (!session.state.autoBattle) {
    updateSession(session.id, {
      state: { ...session.state, autoBattle: true },
    });
  }

  return runBattleStep(pool, sessionId, DEFAULT_MAX_STEPS);
}
