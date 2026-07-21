import { DOT_DEFAULT_TURNS } from "../../types";
import { SKILL_UNLOCK_LEVELS } from "../types";
import type { SkillDefinition } from "../types";

export const IMPERIAL_IRON_PALM: SkillDefinition = {
  id: "murim_palm",
  path: "imperial",
  stringId: "skills.murim.palm",
  icon: "👊",
  mpCost: 15,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[0],
  slotTier: 1,
  autoPriority: 75,
  cooldownTurns: 2,
  damageMultiplier: 1.35,
  guaranteedStatus: "bleed",
  statusProcBonus: 0.15,
};

export const IMPERIAL_BLEED_TURNS = DOT_DEFAULT_TURNS;
