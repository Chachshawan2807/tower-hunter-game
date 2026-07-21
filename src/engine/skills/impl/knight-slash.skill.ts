import { SKILL_UNLOCK_LEVELS } from "../types";
import type { SkillDefinition } from "../types";

export const KNIGHT_SLASH: SkillDefinition = {
  id: "knight_slash",
  path: "knight",
  stringId: "skills.knight.slash",
  icon: "⚔",
  mpCost: 10,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[0],
  slotTier: 1,
  autoPriority: 70,
  cooldownTurns: 1,
  damageMultiplier: 1.2,
};
