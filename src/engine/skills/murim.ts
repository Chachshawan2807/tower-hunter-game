import {
  ATK_BUFF_MAGNITUDE,
  BUFF_DEBUFF_DEFAULT_TURNS,
  DOT_DEFAULT_TURNS,
} from "../types";
import { SKILL_UNLOCK_LEVELS } from "./types";
import type { SkillDefinition } from "./types";

export const MURIM_IRON_PALM: SkillDefinition = {
  id: "murim_palm",
  path: "murim",
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

export const MURIM_SHADOW_STEP: SkillDefinition = {
  id: "murim_dash",
  path: "murim",
  stringId: "skills.murim.dash",
  icon: "💨",
  mpCost: 10,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[1],
  slotTier: 2,
  autoPriority: 55,
  cooldownTurns: 1,
  damageMultiplier: 1,
  accuracyBonus: 30,
};

export const MURIM_INNER_QI: SkillDefinition = {
  id: "murim_qi",
  path: "murim",
  stringId: "skills.murim.qi",
  icon: "🔥",
  mpCost: 20,
  kind: "buff",
  targetType: "self",
  unlockLevel: SKILL_UNLOCK_LEVELS[2],
  slotTier: 3,
  autoPriority: 35,
  cooldownTurns: 3,
  selfStatus: {
    type: "atk_buff",
    turns: BUFF_DEBUFF_DEFAULT_TURNS,
    magnitude: ATK_BUFF_MAGNITUDE,
  },
};

export const MURIM_DRAGON_FIST: SkillDefinition = {
  id: "murim_dragon",
  path: "murim",
  stringId: "skills.murim.dragon",
  icon: "🐉",
  mpCost: 30,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[3],
  slotTier: 4,
  autoPriority: 90,
  cooldownTurns: 4,
  damageMultiplier: 1.75,
  guaranteedStatus: "bleed",
  statusProcBonus: 0.25,
};

export const MURIM_SKILLS: SkillDefinition[] = [
  MURIM_IRON_PALM,
  MURIM_SHADOW_STEP,
  MURIM_INNER_QI,
  MURIM_DRAGON_FIST,
];

export const MURIM_BLEED_TURNS = DOT_DEFAULT_TURNS;
