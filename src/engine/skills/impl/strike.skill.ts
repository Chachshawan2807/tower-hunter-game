import type { SkillDefinition } from "../types";

export const BASIC_ATTACK: SkillDefinition = {
  id: "basic_attack",
  path: "basic",
  stringId: "skills.basic_attack",
  icon: "⚔",
  mpCost: 0,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: 1,
  slotTier: 1,
  autoPriority: 0,
  cooldownTurns: 0,
  damageMultiplier: 1,
};

export const STRIKE_SKILL = BASIC_ATTACK;
