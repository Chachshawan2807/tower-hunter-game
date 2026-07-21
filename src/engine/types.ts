/**
 * Engine type barrel — canonical contracts live in src/types/.
 * @see docs/ARCHITECTURE.md
 */
export type {
  StatValue,
  TargetType,
  ActionIntentPayload,
  CharacterStats,
  CombatStats,
  EntitySide,
  BattleEntity,
  StatusEffectType,
  StatusEffect,
  SkillPath,
  ItemRarity,
  ItemDefinition,
  RewardPayload,
  EnemyBaseStats,
  TurnPhase,
  TurnContext,
  BattleSnapshot,
  PlayerIntent,
  AnimationEventType,
  AnimationEvent,
  AnimationQueuePayload,
  TurnResolutionResult,
} from "../types";

export {
  toCharacterStats,
  toActionIntent,
  buildTurnResolutionResult,
} from "../types";

export const ACTION_GAUGE_MAX = 100;
export const DOT_HP_PERCENT = 0.05;
export const DOT_DEFAULT_TURNS = 3;
export const CC_DEFAULT_TURNS = 1;
export const ATK_BUFF_MAGNITUDE = 0.2;
export const DEF_BUFF_MAGNITUDE = 0.2;
export const ATK_DEBUFF_MAGNITUDE = -0.25;
export const DEF_DEBUFF_MAGNITUDE = -0.25;
export const BUFF_DEBUFF_DEFAULT_TURNS = 2;
export const ENEMY_EXPONENT_BASE = 1.08;
export const BOSS_STAT_MULTIPLIER = 1.5;
export const BOSS_FLOOR_INTERVAL = 10;
export const INVENTORY_MAX_CAPACITY = 100;
export const MAILBOX_TTL_DAYS = 14;

export function isBossFloor(floor: number): boolean {
  return floor > 0 && floor % BOSS_FLOOR_INTERVAL === 0;
}

export function isCrowdControl(type: import("../types").StatusEffectType): boolean {
  return type === "stun" || type === "freeze" || type === "silence";
}

export function isDot(type: import("../types").StatusEffectType): boolean {
  return type === "poison" || type === "bleed";
}

export function isStatModifier(type: import("../types").StatusEffectType): boolean {
  return (
    type === "atk_buff" ||
    type === "def_buff" ||
    type === "atk_debuff" ||
    type === "def_debuff"
  );
}
