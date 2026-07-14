export { defToPercent, DEF_SCALING_CONSTANT } from "./defPercent";
export { calculateBaseDamage } from "./damage";
export {
  calculateHitChance,
  rollHit,
  BASE_HIT_CHANCE,
  MIN_HIT_CHANCE,
  MAX_HIT_CHANCE,
} from "./hitChance";
export {
  calculateCriticalDamage,
  rollCritical,
  type CriticalResult,
} from "./critical";
export {
  tickActionGauge,
  isGaugeReady,
  resetActionGauge,
  tickAllGauges,
  selectNextActor,
  type GaugeTickResult,
} from "./actionGauge";
export {
  scaleExponentialStat,
  scaleLinearStat,
  scaleEnemyStatsForFloor,
  DEFAULT_LINEAR_SCALING,
  type LinearScalingConfig,
} from "./enemyScaling";
export { calculateDotDamage, applyDotDamage } from "./dot";
export {
  applyStatModifiers,
  tickStatusEffects,
} from "./statusEffects";
export {
  getDropChance,
  rollItemDrop,
  isValidBossDropRarity,
  filterBossDropRarity,
  calculateFloorExpReward,
  calculateFloorGoldReward,
} from "./rewards";
export {
  resolveAttack,
  resolveAttackWithModifiers,
  type AttackResolutionInput,
  type AttackResolutionResult,
  type EffectiveCombatInput,
} from "./attackResolution";
