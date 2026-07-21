import { getSkillsForPath } from "./catalog";
import {
  getUnlockedSkills,
  isSkillUnlocked,
} from "./skillUnlock";
import type { SkillPath } from "../types";

export interface SkillLoadout {
  path: SkillPath;
  activeSlots: [string, string];
}

const DEFAULT_ACTIVE: Record<SkillPath, [string, string]> = {
  imperial: ["murim_palm", "murim_dragon"],
  knight: ["knight_slash", "knight_charge"],
  vanguard: ["fantasy_bolt", "fantasy_meteor"],
};

export function getDefaultLoadout(
  path: SkillPath,
  unlockedSkillIds: readonly string[]
): SkillLoadout {
  const unlocked = getUnlockedSkills(path, unlockedSkillIds);
  const preferred = DEFAULT_ACTIVE[path];
  const slot1 =
    unlocked.find((s) => s.id === preferred[0])?.id ??
    unlocked[0]?.id ??
    preferred[0];
  const slot2Candidate =
    unlocked.find((s) => s.id === preferred[1])?.id ??
    unlocked.find((s) => s.id !== slot1)?.id ??
    slot1;
  return { path, activeSlots: [slot1, slot2Candidate] };
}

export function deriveAutoSkills(
  unlockedIds: string[],
  activeSlots: [string, string]
): string[] {
  const activeSet = new Set(activeSlots);
  return unlockedIds.filter((id) => !activeSet.has(id));
}

export function validateLoadout(
  path: SkillPath,
  activeSlots: [string, string],
  unlockedSkillIds: readonly string[]
): { valid: boolean; error?: string } {
  if (activeSlots[0] === activeSlots[1]) {
    return { valid: false, error: "DUPLICATE_SLOT" };
  }
  const pathSkillIds = new Set(getSkillsForPath(path).map((s) => s.id));
  for (const id of activeSlots) {
    if (!pathSkillIds.has(id)) return { valid: false, error: "INVALID_SKILL" };
    const skill = getSkillsForPath(path).find((s) => s.id === id)!;
    if (!isSkillUnlocked(skill, unlockedSkillIds)) {
      return { valid: false, error: "SKILL_LOCKED" };
    }
  }
  return { valid: true };
}
