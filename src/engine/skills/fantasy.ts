import { CC_DEFAULT_TURNS } from "../types";
import { SKILL_UNLOCK_LEVELS } from "./types";
import type { SkillDefinition } from "./types";

export const FANTASY_ARCANE_BOLT: SkillDefinition = {
  id: "fantasy_bolt",
  path: "fantasy",
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

export const FANTASY_FROST_NOVA: SkillDefinition = {
  id: "fantasy_freeze",
  path: "fantasy",
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

export const FANTASY_HOLY_LIGHT: SkillDefinition = {
  id: "fantasy_heal",
  path: "fantasy",
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

export const FANTASY_METEOR: SkillDefinition = {
  id: "fantasy_meteor",
  path: "fantasy",
  stringId: "skills.fantasy.meteor",
  icon: "☄",
  mpCost: 35,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[3],
  slotTier: 4,
  autoPriority: 95,
  cooldownTurns: 5,
  damageMultiplier: 1.9,
  defPierce: 0.5,
};

export const FANTASY_SKILLS: SkillDefinition[] = [
  FANTASY_ARCANE_BOLT,
  FANTASY_FROST_NOVA,
  FANTASY_HOLY_LIGHT,
  FANTASY_METEOR,
];

export const FANTASY_FREEZE_TURNS = CC_DEFAULT_TURNS;
