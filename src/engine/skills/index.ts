export type {
  SkillDefinition,
  SkillKind,
  SkillTargetType,
  SkillSelfStatus,
} from "./types";

export { BASIC_ATTACK } from "./basicAttack";
export { MURIM_SKILLS } from "./murim";
export { KNIGHT_SKILLS } from "./knight";
export { FANTASY_SKILLS } from "./fantasy";

export {
  getSkillById,
  getSkillsForPath,
  getAllSkills,
  isValidSkillForPath,
} from "./catalog";

export {
  canAffordSkill,
  canUseSkill,
  isSkillUnlocked,
  isSkillOnCooldown,
  getSkillCooldownRemaining,
  getAvailableSkills,
  getUnlockedSkills,
  applySkillCooldown,
  tickSkillCooldowns,
  pickAutoSkill,
  resolveSkillId,
} from "./resolver";

export {
  deriveAutoSkills,
  getDefaultLoadout,
  validateLoadout,
} from "./loadout";
export type { SkillLoadout } from "./loadout";

export { SKILL_UNLOCK_LEVELS } from "./types";
