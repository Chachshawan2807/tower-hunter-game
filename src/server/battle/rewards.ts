import {
  calculateFloorExpReward,
  calculateFloorGoldReward,
} from "../../engine/formulas";
import type { RewardPayload } from "../../engine/types";
import {
  applyBattleWinProgress,
  processWalletTransaction,
  type DbPool,
} from "../db";

export function buildBattleRewards(
  floor: number,
  _rng: () => number = Math.random
): RewardPayload {
  return {
    exp: calculateFloorExpReward(floor),
    gold: calculateFloorGoldReward(floor),
    items: [],
  };
}

export async function grantBattleRewards(
  pool: DbPool,
  userId: string,
  sessionId: string,
  floor: number,
  rng: () => number = Math.random
): Promise<RewardPayload> {
  const rewards = buildBattleRewards(floor, rng);

  await processWalletTransaction(pool, {
    idempotencyKey: `battle_reward:${sessionId}`,
    userId,
    amount: rewards.gold,
    type: "reward",
    metadata: { floor, sessionId },
  });

  await applyBattleWinProgress(pool, userId, floor, rewards.exp);

  return rewards;
}
