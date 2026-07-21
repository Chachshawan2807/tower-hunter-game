import { getPlayerCatalogSkills } from "./catalog";
import type { SkillDefinition } from "./types";

const SP_BY_TIER = [1, 2, 4, 6, 8, 10, 12] as const;

export function getSkillUnlockSpCost(skill: SkillDefinition): number {
  if (skill.unlockSpCost !== undefined) return skill.unlockSpCost;
  const tier = skill.catalogTier ?? skill.slotTier;
  const idx = Math.min(Math.max(tier - 1, 0), SP_BY_TIER.length - 1);
  return SP_BY_TIER[idx];
}

export function isSkillUnlocked(
  skill: SkillDefinition,
  unlockedSkillIds: ReadonlySet<string> | readonly string[]
): boolean {
  const unlocked =
    unlockedSkillIds instanceof Set
      ? unlockedSkillIds
      : new Set(unlockedSkillIds);
  return unlocked.has(skill.id);
}

export function getUnlockedSkills(
  _path: string,
  unlockedSkillIds: ReadonlySet<string> | readonly string[]
): SkillDefinition[] {
  return getPlayerCatalogSkills().filter((skill) =>
    isSkillUnlocked(skill, unlockedSkillIds)
  );
}

export function isSkillUnlockedByLevel(
  skill: SkillDefinition,
  playerLevel: number
): boolean {
  return playerLevel >= skill.unlockLevel;
}
