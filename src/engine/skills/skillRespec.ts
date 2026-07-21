import type { SkillUpgradeRanks } from "./types";
import { spCostForNextRank } from "./skillPoints";
import { getSkillUnlockSpCost } from "./skillUnlock";
import { getSkillById } from "./catalog";

export function calculateUnlockSpSpent(unlockedSkillIds: readonly string[]): number {
  let total = 0;
  for (const id of unlockedSkillIds) {
    total += getSkillUnlockSpCost(getSkillById(id));
  }
  return total;
}

export function calculateUpgradeSpSpent(
  upgrades: Record<string, SkillUpgradeRanks>
): number {
  let total = 0;
  for (const ranks of Object.values(upgrades)) {
    for (const branch of [
      "damage",
      "cooldown",
      "mpCost",
      "statusPotency",
      "healPower",
      "passivePotency",
    ] as const) {
      for (let r = 0; r < ranks[branch]; r++) {
        total += spCostForNextRank(r);
      }
    }
  }
  return total;
}

export function calculateRespecRefund(
  unlockedSkillIds: readonly string[],
  upgrades: Record<string, SkillUpgradeRanks>
): number {
  return calculateUnlockSpSpent(unlockedSkillIds) + calculateUpgradeSpSpent(upgrades);
}
