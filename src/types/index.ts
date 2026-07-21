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
} from "./combat.interface";
export { toCharacterStats } from "./combat.interface";

export type {
  TurnPhase,
  TurnContext,
  BattleSnapshot,
  PlayerIntent,
} from "./state.interface";
export { toActionIntent } from "./state.interface";

export type {
  AnimationEventType,
  AnimationEvent,
  AnimationQueuePayload,
  TurnResolutionResult,
} from "./animation.interface";
export { buildTurnResolutionResult } from "./animation.interface";
