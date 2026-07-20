import type { SkillDefinition, SkillUpgradeRanks } from "./types";

export type UpgradeBranch = "damage" | "cooldown" | "mpCost";

export function spCostForNextRank(currentRank: number): number {
  return currentRank + 1;
}

export const SKILL_POINTS_PER_LEVEL_UP = 1;
export const SKILL_POINTS_BOSS_BONUS = 1;

/** Skill points for unlocks/upgrades (+1 per level, +1 bonus on boss floor win). */
export function calculateSpGrant(
  oldLevel: number,
  newLevel: number,
  isBoss: boolean
): number {
  const levelsGained = Math.max(0, newLevel - oldLevel);
  return (
    levelsGained * SKILL_POINTS_PER_LEVEL_UP + (isBoss ? SKILL_POINTS_BOSS_BONUS : 0)
  );
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
