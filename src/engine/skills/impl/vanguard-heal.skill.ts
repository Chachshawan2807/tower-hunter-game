import { SKILL_UNLOCK_LEVELS } from "../types";
import type { SkillDefinition } from "../types";

export const VANGUARD_HOLY_LIGHT: SkillDefinition = {
  id: "fantasy_heal",
  path: "vanguard",
  stringId: "skills.fantasy.heal",
  icon: "✨",
  mpCost: 25,
  kind: "heal",
  targetType: "self",
  unlockLevel: SKILL_UNLOCK_LEVELS[2],
  slotTier: 3,
  autoPriority: 40,
  cooldownTurns: 3,
  healPercent: 0.25,
};
