import { CC_DEFAULT_TURNS } from "../../types";
import { SKILL_UNLOCK_LEVELS } from "../types";
import type { SkillDefinition } from "../types";

export const VANGUARD_METEOR: SkillDefinition = {
  id: "fantasy_meteor",
  path: "vanguard",
  stringId: "skills.fantasy.meteor",
  icon: "☄",
  mpCost: 35,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[3],
  slotTier: 4,
  autoPriority: 95,
  cooldownTurns: 5,
  damageMultiplier: 1.85,
  defPierce: 0.5,
};

export const VANGUARD_FREEZE_TURNS = CC_DEFAULT_TURNS;
