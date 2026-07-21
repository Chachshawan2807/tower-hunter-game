import type { SkillDefinition } from "../types";

const ENEMY_DEFAULTS = {
  path: "enemy" as const,
  mpCost: 0,
  unlockLevel: 0,
  slotTier: 1 as const,
  autoPriority: 50,
};

export const ENEMY_STUN_SMASH: SkillDefinition = {
  ...ENEMY_DEFAULTS,
  id: "enemy_stun_smash",
  stringId: "skills.enemy.stun_smash",
  icon: "🔱",
  kind: "attack",
  targetType: "enemy",
  cooldownTurns: 4,
  damageMultiplier: 1.2,
  guaranteedStatus: "stun",
};
