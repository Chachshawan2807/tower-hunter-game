import type { SkillDefinition, SkillUpgradeRanks } from "./types";

export type UpgradeBranch = "damage" | "cooldown" | "mpCost";

export function spCostForNextRank(currentRank: number): number {
  return currentRank + 1;
}

export function calculateSpGrant(
  oldLevel: number,
  newLevel: number,
  isBoss: boolean
): number {
  const levelDiff = Math.max(0, newLevel - oldLevel);
  return levelDiff + (isBoss ? 2 : 0);
}

export function canUpgradeBranch(
  skill: SkillDefinition,
  branch: UpgradeBranch,
  ranks: SkillUpgradeRanks
): { allowed: boolean; reason?: string } {
  if (branch === "damage" && skill.kind !== "attack") {
    return { allowed: false, reason: "NOT_ATTACK" };
  }
  if (ranks[branch] >= 3) {
    return { allowed: false, reason: "MAX_RANK" };
  }
  return { allowed: true };
}
