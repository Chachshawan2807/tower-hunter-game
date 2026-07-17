import type { SkillPath } from "../types";
import { getSkillsForPath } from "./catalog";
import type { SkillDefinition } from "./types";

/** SP cost to unlock a skill (by slot tier: 1–4). */
export function getSkillUnlockSpCost(skill: SkillDefinition): number {
  return skill.slotTier;
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
  path: SkillPath,
  unlockedSkillIds: ReadonlySet<string> | readonly string[]
): SkillDefinition[] {
  return getSkillsForPath(path).filter((skill) =>
    isSkillUnlocked(skill, unlockedSkillIds)
  );
}

/** Legacy level gate — used only for one-time DB backfill. */
export function isSkillUnlockedByLevel(
  skill: SkillDefinition,
  playerLevel: number
): boolean {
  return playerLevel >= skill.unlockLevel;
}
