import { SKILL_UNLOCK_LEVELS } from "../types";
import type { SkillDefinition } from "../types";

export const VANGUARD_FROST_NOVA: SkillDefinition = {
  id: "fantasy_freeze",
  path: "vanguard",
  stringId: "skills.fantasy.freeze",
  icon: "❄",
  mpCost: 20,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[1],
  slotTier: 2,
  autoPriority: 60,
  cooldownTurns: 2,
  damageMultiplier: 1,
  guaranteedStatus: "freeze",
  statusProcBonus: 0.25,
};
