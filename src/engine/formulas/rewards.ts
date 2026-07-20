import type { StatValue } from "../types";
import { isBossFloor } from "../types";

/**
 * Reward scaling increases with tower floor (linear baseline).
 * Boss floors grant bonus EXP and Gold.
 */
export function calculateFloorExpReward(
  floor: StatValue,
  baseExp: StatValue = 10
): StatValue {
  const bossMult = isBossFloor(floor) ? 1.5 : 1.0;
  return Math.floor(baseExp * floor * bossMult);
}

export function calculateFloorGoldReward(
  floor: StatValue,
  baseGold: bigint = 5n
): bigint {
  const bossMult = isBossFloor(floor) ? 2n : 1n;
  return baseGold * BigInt(Math.max(1, Math.floor(floor))) * bossMult;
}
