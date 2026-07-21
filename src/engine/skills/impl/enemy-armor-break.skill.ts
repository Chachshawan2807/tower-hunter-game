import type { SkillDefinition } from "../types";

const ENEMY_DEFAULTS = {
  path: "enemy" as const,
  mpCost: 0,
  unlockLevel: 0,
  slotTier: 1 as const,
  autoPriority: 50,
};

export const ENEMY_ARMOR_BREAK: SkillDefinition = {
  ...ENEMY_DEFAULTS,
  id: "enemy_armor_break",
  stringId: "skills.enemy.armor_break",
  icon: "💢",
  kind: "attack",
  targetType: "enemy",
  cooldownTurns: 3,
  damageMultiplier: 1,
  guaranteedStatus: "def_debuff",
};
