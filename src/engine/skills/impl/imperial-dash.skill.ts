import { SKILL_UNLOCK_LEVELS } from "../types";
import type { SkillDefinition } from "../types";

export const IMPERIAL_SHADOW_STEP: SkillDefinition = {
  id: "murim_dash",
  path: "imperial",
  stringId: "skills.murim.dash",
  icon: "💨",
  mpCost: 10,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[1],
  slotTier: 2,
  autoPriority: 55,
  cooldownTurns: 1,
  damageMultiplier: 1,
  accuracyBonus: 30,
};
