import { findEntity, getOpponents } from "../../engine/states";
import type { PlayerIntent } from "../../types";
import { BattleServiceError } from "./errors";
import { getBattleSession } from "./sessionAccess";
import { validateTargetEntity } from "./validation";

export function validateBattleIntent(
  session: ReturnType<typeof getBattleSession>,
  intent: PlayerIntent
): void {
  if (intent.type !== "request_action" || !session.waitingActorId) {
    return;
  }

  if (!intent.turnNonce || intent.turnNonce !== session.turnNonce) {
    throw new BattleServiceError(
      "Stale or missing turn nonce",
      "STALE_TURN_NONCE",
      409
    );
  }

  const actor = findEntity(session.state, session.waitingActorId);
  if (!actor) {
    throw new BattleServiceError("Waiting actor not found", "INVALID_ACTOR", 400);
  }

  validateTargetEntity(
    getOpponents(session.state, actor).map((e) => e.id),
    intent.targetId
  );
}
