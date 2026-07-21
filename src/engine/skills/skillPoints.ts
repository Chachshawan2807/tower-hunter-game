import type { SkillDefinition, SkillUpgradeRanks } from "./types";
import { isPassiveSkillType } from "./skillTypes";

export type UpgradeBranch =
  | "damage"
  | "cooldown"
  | "mpCost"
  | "statusPotency"
  | "healPower"
  | "passivePotency";

export const MAX_UPGRADE_RANK = 4;

export function spCostForNextRank(currentRank: number): number {
  return currentRank + 1;
}

export const SKILL_POINTS_PER_LEVEL_UP = 1;
export const SKILL_POINTS_BOSS_BONUS = 1;

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
  if (ranks[branch] >= MAX_UPGRADE_RANK) {
    return { allowed: false, reason: "MAX_RANK" };
  }
  if (branch === "damage" && skill.kind !== "attack") {
    return { allowed: false, reason: "NOT_ATTACK" };
  }
  if (branch === "healPower" && skill.kind !== "heal") {
    return { allowed: false, reason: "NOT_HEAL" };
  }
  if (
    branch === "passivePotency" &&
    (!skill.skillType || !isPassiveSkillType(skill.skillType))
  ) {
    return { allowed: false, reason: "NOT_PASSIVE" };
  }
  if (
    branch === "statusPotency" &&
    !skill.guaranteedStatus &&
    !skill.statusProcBonus
  ) {
    return { allowed: false, reason: "NOT_STATUS" };
  }
  return { allowed: true };
}
