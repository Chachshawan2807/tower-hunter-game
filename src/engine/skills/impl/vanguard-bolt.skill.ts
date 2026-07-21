import { SKILL_UNLOCK_LEVELS } from "../types";
import type { SkillDefinition } from "../types";

export const VANGUARD_ARCANE_BOLT: SkillDefinition = {
  id: "fantasy_bolt",
  path: "vanguard",
  stringId: "skills.fantasy.bolt",
  icon: "🔮",
  mpCost: 15,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[0],
  slotTier: 1,
  autoPriority: 70,
  cooldownTurns: 1,
  damageMultiplier: 1.25,
  defPierce: 0.3,
};
