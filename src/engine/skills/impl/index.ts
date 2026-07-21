export { BASIC_ATTACK, STRIKE_SKILL } from "./strike.skill";

export { IMPERIAL_IRON_PALM, IMPERIAL_BLEED_TURNS } from "./imperial-palm.skill";
export { IMPERIAL_SHADOW_STEP } from "./imperial-dash.skill";
export { IMPERIAL_INNER_QI } from "./imperial-qi.skill";
export { IMPERIAL_DRAGON_FIST } from "./imperial-dragon.skill";

export { KNIGHT_SLASH } from "./knight-slash.skill";
export { KNIGHT_GUARD } from "./knight-guard.skill";
export { KNIGHT_SHIELD_BASH } from "./knight-bash.skill";
export { KNIGHT_CHARGE, KNIGHT_STUN_TURNS } from "./knight-charge.skill";

export { VANGUARD_ARCANE_BOLT } from "./vanguard-bolt.skill";
export { VANGUARD_FROST_NOVA } from "./vanguard-freeze.skill";
export { VANGUARD_HOLY_LIGHT } from "./vanguard-heal.skill";
export { VANGUARD_METEOR, VANGUARD_FREEZE_TURNS } from "./vanguard-meteor.skill";

export { ENEMY_STRIKE } from "./enemy-strike.skill";
export { ENEMY_HEAVY_BLOW } from "./enemy-heavy-blow.skill";
export { ENEMY_POISON_STAB } from "./enemy-poison-stab.skill";
export { ENEMY_ARMOR_BREAK } from "./enemy-armor-break.skill";
export { ENEMY_ENRAGE } from "./enemy-enrage.skill";
export { ENEMY_SLAM } from "./enemy-slam.skill";
export { ENEMY_STUN_SMASH } from "./enemy-stun-smash.skill";
export { ENEMY_REGENERATE } from "./enemy-regenerate.skill";

import { IMPERIAL_DRAGON_FIST } from "./imperial-dragon.skill";
import { IMPERIAL_INNER_QI } from "./imperial-qi.skill";
import { IMPERIAL_SHADOW_STEP } from "./imperial-dash.skill";
import { IMPERIAL_IRON_PALM } from "./imperial-palm.skill";
import { KNIGHT_CHARGE } from "./knight-charge.skill";
import { KNIGHT_GUARD } from "./knight-guard.skill";
import { KNIGHT_SHIELD_BASH } from "./knight-bash.skill";
import { KNIGHT_SLASH } from "./knight-slash.skill";
import { VANGUARD_METEOR } from "./vanguard-meteor.skill";
import { VANGUARD_HOLY_LIGHT } from "./vanguard-heal.skill";
import { VANGUARD_FROST_NOVA } from "./vanguard-freeze.skill";
import { VANGUARD_ARCANE_BOLT } from "./vanguard-bolt.skill";
import { ENEMY_REGENERATE } from "./enemy-regenerate.skill";
import { ENEMY_STUN_SMASH } from "./enemy-stun-smash.skill";
import { ENEMY_SLAM } from "./enemy-slam.skill";
import { ENEMY_ENRAGE } from "./enemy-enrage.skill";
import { ENEMY_ARMOR_BREAK } from "./enemy-armor-break.skill";
import { ENEMY_POISON_STAB } from "./enemy-poison-stab.skill";
import { ENEMY_HEAVY_BLOW } from "./enemy-heavy-blow.skill";
import { ENEMY_STRIKE } from "./enemy-strike.skill";
import type { SkillDefinition } from "../types";

export const IMPERIAL_SKILLS: SkillDefinition[] = [
  IMPERIAL_IRON_PALM,
  IMPERIAL_SHADOW_STEP,
  IMPERIAL_INNER_QI,
  IMPERIAL_DRAGON_FIST,
];

export const KNIGHT_SKILLS: SkillDefinition[] = [
  KNIGHT_SLASH,
  KNIGHT_GUARD,
  KNIGHT_SHIELD_BASH,
  KNIGHT_CHARGE,
];

export const VANGUARD_SKILLS: SkillDefinition[] = [
  VANGUARD_ARCANE_BOLT,
  VANGUARD_FROST_NOVA,
  VANGUARD_HOLY_LIGHT,
  VANGUARD_METEOR,
];

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
