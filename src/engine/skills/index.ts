export type {
  SkillDefinition,
  SkillKind,
  SkillTargetType,
  SkillSelfStatus,
  SkillUpgradeRanks,
} from "./types";

export { BASIC_ATTACK } from "./basicAttack";
export { MURIM_SKILLS } from "./murim";
export { KNIGHT_SKILLS } from "./knight";
export { FANTASY_SKILLS } from "./fantasy";
export { ENEMY_SKILLS } from "./enemy";

export {
  resolveEnemyTemplate,
  getEnemyTemplateById,
  ENEMY_TEMPLATES,
  GUARDIAN_LOW,
  GUARDIAN_MID,
  GUARDIAN_HIGH,
  BOSS_EARLY,
  BOSS_MID,
  BOSS_LATE,
} from "./enemyTemplates";
export type { EnemyTemplate } from "./enemyTemplates";

export { pickEnemySkill } from "./enemyAi";

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

export { resolveEffectiveSkill } from "./effectiveSkill";

export {
  spCostForNextRank,
  calculateSpGrant,
  canUpgradeBranch,
} from "./skillPoints";
export type { UpgradeBranch } from "./skillPoints";

export { SKILL_UNLOCK_LEVELS } from "./types";
