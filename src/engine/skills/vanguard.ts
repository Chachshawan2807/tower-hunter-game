import { CC_DEFAULT_TURNS } from "../types";
import { SKILL_UNLOCK_LEVELS } from "./types";
import type { SkillDefinition } from "./types";

export const VANGUARD_ARCANE_BOLT: SkillDefinition = {
  id: "fantasy_bolt",
  path: "vanguard",
  stringId: "skills.fantasy.bolt",
  icon: "🔮",
  mpCost: 15,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[0],
  slotTier: 1,
  autoPriority: 70,
  cooldownTurns: 1,
  damageMultiplier: 1.25,
  defPierce: 0.3,
};

export const VANGUARD_FROST_NOVA: SkillDefinition = {
  id: "fantasy_freeze",
  path: "vanguard",
  stringId: "skills.fantasy.freeze",
  icon: "❄",
  mpCost: 20,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[1],
  slotTier: 2,
  autoPriority: 60,
  cooldownTurns: 2,
  damageMultiplier: 1,
  guaranteedStatus: "freeze",
  statusProcBonus: 0.25,
};

export const VANGUARD_HOLY_LIGHT: SkillDefinition = {
  id: "fantasy_heal",
  path: "vanguard",
  stringId: "skills.fantasy.heal",
  icon: "✨",
  mpCost: 25,
  kind: "heal",
  targetType: "self",
  unlockLevel: SKILL_UNLOCK_LEVELS[2],
  slotTier: 3,
  autoPriority: 40,
  cooldownTurns: 3,
  healPercent: 0.25,
};

export const VANGUARD_METEOR: SkillDefinition = {
  id: "fantasy_meteor",
  path: "vanguard",
  stringId: "skills.fantasy.meteor",
  icon: "☄",
  mpCost: 35,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[3],
  slotTier: 4,
  autoPriority: 95,
  cooldownTurns: 5,
  damageMultiplier: 1.85,
  defPierce: 0.5,
};

export const VANGUARD_SKILLS: SkillDefinition[] = [
  VANGUARD_ARCANE_BOLT,
  VANGUARD_FROST_NOVA,
  VANGUARD_HOLY_LIGHT,
  VANGUARD_METEOR,
];

export const VANGUARD_FREEZE_TURNS = CC_DEFAULT_TURNS;
