import {
  ATK_BUFF_MAGNITUDE,
  BUFF_DEBUFF_DEFAULT_TURNS,
} from "../types";
import type { SkillDefinition } from "./types";

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

export const ENEMY_ENRAGE: SkillDefinition = {
  ...ENEMY_DEFAULTS,
  id: "enemy_enrage",
  stringId: "skills.enemy.enrage",
  icon: "😤",
  kind: "buff",
  targetType: "self",
  cooldownTurns: 4,
  selfStatus: {
    type: "atk_buff",
    turns: BUFF_DEBUFF_DEFAULT_TURNS,
    magnitude: ATK_BUFF_MAGNITUDE,
  },
};

export const ENEMY_SLAM: SkillDefinition = {
  ...ENEMY_DEFAULTS,
  id: "enemy_slam",
  stringId: "skills.enemy.slam",
  icon: "💥",
  kind: "attack",
  targetType: "enemy",
  cooldownTurns: 3,
  damageMultiplier: 1.5,
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

export const ENEMY_SKILLS: SkillDefinition[] = [
  ENEMY_STRIKE,
  ENEMY_HEAVY_BLOW,
  ENEMY_POISON_STAB,
  ENEMY_ARMOR_BREAK,
  ENEMY_ENRAGE,
  ENEMY_SLAM,
  ENEMY_STUN_SMASH,
  ENEMY_REGENERATE,
];
