export { BASIC_ATTACK, STRIKE_SKILL } from "./strike.skill";

export { ENEMY_STRIKE } from "./enemy-strike.skill";
export { ENEMY_HEAVY_BLOW } from "./enemy-heavy-blow.skill";
export { ENEMY_POISON_STAB } from "./enemy-poison-stab.skill";
export { ENEMY_ARMOR_BREAK } from "./enemy-armor-break.skill";
export { ENEMY_ENRAGE } from "./enemy-enrage.skill";
export { ENEMY_SLAM } from "./enemy-slam.skill";
export { ENEMY_STUN_SMASH } from "./enemy-stun-smash.skill";
export { ENEMY_REGENERATE } from "./enemy-regenerate.skill";

import { ENEMY_REGENERATE } from "./enemy-regenerate.skill";
import { ENEMY_STUN_SMASH } from "./enemy-stun-smash.skill";
import { ENEMY_SLAM } from "./enemy-slam.skill";
import { ENEMY_ENRAGE } from "./enemy-enrage.skill";
import { ENEMY_ARMOR_BREAK } from "./enemy-armor-break.skill";
import { ENEMY_POISON_STAB } from "./enemy-poison-stab.skill";
import { ENEMY_HEAVY_BLOW } from "./enemy-heavy-blow.skill";
import { ENEMY_STRIKE } from "./enemy-strike.skill";
import type { SkillDefinition } from "../types";

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
