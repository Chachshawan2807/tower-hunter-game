import { SKILL_UNLOCK_LEVELS } from "../types";
import type { SkillDefinition } from "../types";

export const KNIGHT_SHIELD_BASH: SkillDefinition = {
  id: "knight_bash",
  path: "knight",
  stringId: "skills.knight.bash",
  icon: "💥",
  mpCost: 20,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[2],
  slotTier: 3,
  autoPriority: 65,
  cooldownTurns: 3,
  damageMultiplier: 1.3,
  guaranteedStatus: "stun",
};
