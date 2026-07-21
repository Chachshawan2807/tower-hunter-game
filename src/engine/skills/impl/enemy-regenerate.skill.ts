import type { SkillDefinition } from "../types";

const ENEMY_DEFAULTS = {
  path: "enemy" as const,
  mpCost: 0,
  unlockLevel: 0,
  slotTier: 1 as const,
  autoPriority: 50,
};

export const ENEMY_REGENERATE: SkillDefinition = {
  ...ENEMY_DEFAULTS,
  id: "enemy_regenerate",
  stringId: "skills.enemy.regenerate",
  icon: "💚",
  kind: "heal",
  targetType: "self",
  cooldownTurns: 5,
  healPercent: 0.15,
};
