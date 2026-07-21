import type { SkillDefinition } from "../types";

const ENEMY_DEFAULTS = {
  path: "enemy" as const,
  mpCost: 0,
  unlockLevel: 0,
  slotTier: 1 as const,
  autoPriority: 50,
};

export const ENEMY_HEAVY_BLOW: SkillDefinition = {
  ...ENEMY_DEFAULTS,
  id: "enemy_heavy_blow",
  stringId: "skills.enemy.heavy_blow",
  icon: "🔨",
  kind: "attack",
  targetType: "enemy",
  cooldownTurns: 2,
  damageMultiplier: 1.3,
};
