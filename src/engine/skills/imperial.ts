import {
  ATK_BUFF_MAGNITUDE,
  BUFF_DEBUFF_DEFAULT_TURNS,
  DOT_DEFAULT_TURNS,
} from "../types";
import { SKILL_UNLOCK_LEVELS } from "./types";
import type { SkillDefinition } from "./types";

export const IMPERIAL_IRON_PALM: SkillDefinition = {
  id: "murim_palm",
  path: "imperial",
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

export const IMPERIAL_SHADOW_STEP: SkillDefinition = {
  id: "murim_dash",
  path: "imperial",
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

export const IMPERIAL_INNER_QI: SkillDefinition = {
  id: "murim_qi",
  path: "imperial",
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

export const IMPERIAL_DRAGON_FIST: SkillDefinition = {
  id: "murim_dragon",
  path: "imperial",
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

export const IMPERIAL_SKILLS: SkillDefinition[] = [
  IMPERIAL_IRON_PALM,
  IMPERIAL_SHADOW_STEP,
  IMPERIAL_INNER_QI,
  IMPERIAL_DRAGON_FIST,
];

export const IMPERIAL_BLEED_TURNS = DOT_DEFAULT_TURNS;
