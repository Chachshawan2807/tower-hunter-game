export type {
  SkillDefinition,
  SkillKind,
  SkillTargetType,
  SkillUpgradeRanks,
  PassiveEffect,
  SkillOwner,
  UpgradeRank,
} from "./types";

export { BASIC_ATTACK } from "./basicAttack";
export { ENEMY_SKILLS } from "./enemy";

export {
  resolveEnemyTemplate,
  getEnemyTemplateById,
  ENEMY_TEMPLATES,
  GUARDIAN_LOW,
  GUARDIAN_MID,
  GUARDIAN_HIGH,
  GUARDIAN_VOID,
  BOSS_EARLY,
  BOSS_MID,
  BOSS_LATE,
  BOSS_VOID,
} from "./enemyTemplates";
export type { EnemyTemplate } from "./enemyTemplates";

export { pickEnemySkill } from "./enemyAi";

export {
  getSkillById,
  getSkillsForPath,
  getPlayerCatalogSkills,
  getSkillsByType,
  getAllSkills,
  isValidSkillForPath,
  CATALOG_VERSION,
  normalizeSkillId,
  LEGACY_SKILL_ID_MAP,
} from "./catalog";

export type { SkillType } from "./skillTypes";
export { isBattleSkillType, isPassiveSkillType } from "./skillTypes";

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
  resolveSkillId,
} from "./resolver";

export {
  defaultSkillLoadout,
  getDefaultLoadout,
  validateEquipLoadout,
  validateLoadout,
  deriveAutoSkills,
  getBattleSkillsFromLoadout,
  getPassiveSkillsFromLoadout,
  MAX_EQUIP_SLOTS,
  DEFAULT_BATTLE_PREFS,
} from "./loadout";
export type { SkillLoadout, SkillBattlePrefs } from "./loadout";

export { applyEquippedPassives } from "./passiveApply";
export {
  pickSkillForTurn,
  pickAutoSkill,
  getEquippedBattleSkillIds,
  getEquippedPassiveSkillIds,
} from "./skillPicker";

export { resolveEffectiveSkill } from "./effectiveSkill";

export {
  spCostForNextRank,
  calculateSpGrant,
  canUpgradeBranch,
  MAX_UPGRADE_RANK,
} from "./skillPoints";
export type { UpgradeBranch } from "./skillPoints";

export {
  getSkillUnlockSpCost,
  isSkillUnlockedByLevel,
} from "./skillUnlock";

export {
  calculateRespecRefund,
  calculateUnlockSpSpent,
  calculateUpgradeSpSpent,
} from "./skillRespec";

export { SKILL_UNLOCK_LEVELS, EMPTY_SKILL_UPGRADES } from "./types";
