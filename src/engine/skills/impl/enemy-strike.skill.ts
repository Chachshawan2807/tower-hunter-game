import type { SkillDefinition } from "../types";

const ENEMY_DEFAULTS = {
  path: "enemy" as const,
  mpCost: 0,
  unlockLevel: 0,
  slotTier: 1 as const,
  autoPriority: 50,
};

export const ENEMY_STRIKE: SkillDefinition = {
  ...ENEMY_DEFAULTS,
  id: "enemy_strike",
  stringId: "skills.enemy.strike",
  icon: "👊",
  kind: "attack",
  targetType: "enemy",
  cooldownTurns: 0,
  damageMultiplier: 1,
};
