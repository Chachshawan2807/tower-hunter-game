import type { PlayerIntent } from "../types";
import { runWithOfflineQueue } from "../client/offline/queueMutation";
import { api, type BattleSessionResponse, type BattleStepResponse } from "../utils/api";
import { createActionIdempotencyKey } from "../utils/idempotencyKey";
import type { OfflineMutationResult } from "../client/offline/queueMutation";

export async function queueBattleStart(
  userId: string,
  floor: number
): Promise<OfflineMutationResult<BattleSessionResponse>> {
  const idempotencyKey = createActionIdempotencyKey(
    "battle_start",
    userId,
    String(floor)
  );
  return runWithOfflineQueue(
    "battle_start",
    userId,
    idempotencyKey,
    { floor: String(floor), autoBattle: "true" },
    () => api.startBattle(userId, floor, true)
  );
}

export async function queueBattleStep(
  userId: string,
  sessionId: string
): Promise<OfflineMutationResult<BattleStepResponse>> {
  const idempotencyKey = createActionIdempotencyKey(
    "battle_step",
    userId,
    sessionId
  );
  return runWithOfflineQueue(
    "battle_step",
    userId,
    idempotencyKey,
    { sessionId, maxSteps: "20" },
    () => api.battleStep(sessionId, 20)
  );
}

export async function queueBattleIntent(
  userId: string,
  sessionId: string,
  intent: PlayerIntent,
  turnNonce: string | null,
  skillId: string,
  targetId: string
): Promise<OfflineMutationResult<BattleStepResponse>> {
  const idempotencyKey = createActionIdempotencyKey(
    "battle_intent",
    sessionId,
    `${turnNonce ?? "none"}:${skillId}:${targetId}`
  );
  return runWithOfflineQueue(
    "battle_intent",
    userId,
    idempotencyKey,
    { sessionId, intentJson: JSON.stringify(intent) },
    () => api.battleIntent(sessionId, intent)
  );
}
