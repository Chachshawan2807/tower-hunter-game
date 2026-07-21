import { SKILL_UNLOCK_LEVELS } from "../types";
import type { SkillDefinition } from "../types";

export const IMPERIAL_DRAGON_FIST: SkillDefinition = {
  id: "murim_dragon",
  path: "imperial",
  stringId: "skills.murim.dragon",
  icon: "🐉",
  mpCost: 30,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[3],
  slotTier: 4,
  autoPriority: 90,
  cooldownTurns: 4,
  damageMultiplier: 1.75,
  guaranteedStatus: "bleed",
  statusProcBonus: 0.25,
};
