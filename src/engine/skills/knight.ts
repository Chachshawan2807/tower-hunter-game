import {
  CC_DEFAULT_TURNS,
  DEF_BUFF_MAGNITUDE,
  BUFF_DEBUFF_DEFAULT_TURNS,
} from "../types";
import { SKILL_UNLOCK_LEVELS } from "./types";
import type { SkillDefinition } from "./types";

export const KNIGHT_SLASH: SkillDefinition = {
  id: "knight_slash",
  path: "knight",
  stringId: "skills.knight.slash",
  icon: "⚔",
  mpCost: 10,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[0],
  slotTier: 1,
  autoPriority: 70,
  cooldownTurns: 1,
  damageMultiplier: 1.2,
};

export const KNIGHT_GUARD: SkillDefinition = {
  id: "knight_guard",
  path: "knight",
  stringId: "skills.knight.guard",
  icon: "🛡",
  mpCost: 15,
  kind: "buff",
  targetType: "self",
  unlockLevel: SKILL_UNLOCK_LEVELS[1],
  slotTier: 2,
  autoPriority: 30,
  cooldownTurns: 2,
  selfStatus: {
    type: "def_buff",
    turns: BUFF_DEBUFF_DEFAULT_TURNS,
    magnitude: DEF_BUFF_MAGNITUDE,
  },
};

export const KNIGHT_SHIELD_BASH: SkillDefinition = {
  id: "knight_bash",
  path: "knight",
  stringId: "skills.knight.bash",
  icon: "💥",
  mpCost: 20,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[2],
  slotTier: 3,
  autoPriority: 65,
  cooldownTurns: 3,
  damageMultiplier: 1.25,
  guaranteedStatus: "stun",
};

export const KNIGHT_CHARGE: SkillDefinition = {
  id: "knight_charge",
  path: "knight",
  stringId: "skills.knight.charge",
  icon: "🏇",
  mpCost: 28,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[3],
  slotTier: 4,
  autoPriority: 90,
  cooldownTurns: 4,
  damageMultiplier: 1.7,
  guaranteedStatus: "stun",
  statusProcBonus: 0.2,
};

export const KNIGHT_SKILLS: SkillDefinition[] = [
  KNIGHT_SLASH,
  KNIGHT_GUARD,
  KNIGHT_SHIELD_BASH,
  KNIGHT_CHARGE,
];

export const KNIGHT_STUN_TURNS = CC_DEFAULT_TURNS;
