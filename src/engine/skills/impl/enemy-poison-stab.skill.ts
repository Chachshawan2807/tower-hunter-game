import type { SkillDefinition } from "../types";

const ENEMY_DEFAULTS = {
  path: "enemy" as const,
  mpCost: 0,
  unlockLevel: 0,
  slotTier: 1 as const,
  autoPriority: 50,
};

export const ENEMY_POISON_STAB: SkillDefinition = {
  ...ENEMY_DEFAULTS,
  id: "enemy_poison_stab",
  stringId: "skills.enemy.poison_stab",
  icon: "🗡",
  kind: "attack",
  targetType: "enemy",
  cooldownTurns: 3,
  damageMultiplier: 0.9,
  guaranteedStatus: "poison",
};
