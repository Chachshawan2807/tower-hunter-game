import { resetPlayerHpAfterDefeat } from "../db/playerStats";
import type { DbPool } from "../db";
import { grantBattleRewards } from "./rewards";
import { updateSession } from "./sessionStore";
import type { BattleSession } from "./types";

export async function finalizeWinRewards(
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

export async function finalizeBattleOutcome(
  pool: DbPool,
  session: BattleSession
): Promise<BattleSession> {
  if (session.outcomeProcessed || !session.state.isComplete) {
    return session;
  }

  let updated = session;

  if (session.state.result === "win") {
    updated = await finalizeWinRewards(pool, updated);
  } else if (session.state.result === "lose") {
    await resetPlayerHpAfterDefeat(pool, session.userId);
  }

  return updateSession(updated.id, { outcomeProcessed: true }) ?? updated;
}
