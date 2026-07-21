import { getSession } from "./sessionStore";
import { BattleServiceError } from "./errors";
import type { BattleSession } from "./types";

export function getBattleSession(sessionId: string): BattleSession {
  const session = getSession(sessionId);
  if (!session) {
    throw new BattleServiceError(
      "Battle session not found",
      "SESSION_NOT_FOUND",
      404
    );
  }

  return session;
}
