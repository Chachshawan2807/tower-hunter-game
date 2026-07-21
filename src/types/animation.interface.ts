import type { CharacterStats } from "./combat.interface";
import type { BattleSnapshot } from "./state.interface";

export type AnimationEventType =
  | "turn_start"
  | "dot_damage"
  | "cc_skip"
  | "attack"
  | "miss"
  | "critical"
  | "damage"
  | "heal"
  | "buff_apply"
  | "debuff_apply"
  | "buff_expire"
  | "debuff_expire"
  | "turn_end"
  | "battle_win"
  | "battle_lose";

export interface AnimationEvent {
  type: AnimationEventType;
  actorId: string;
  targetId?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  /** Links to visual effect keys in src/engine/art/ */
  visualEffectId?: string;
}

export interface AnimationQueuePayload {
  events: AnimationEvent[];
  finalState: BattleSnapshot;
}

/** Engine output packet consumed by the client animation queue. */
export interface TurnResolutionResult {
  readonly nextTurnNonce: string;
  readonly updatedCharacters: readonly CharacterStats[];
  readonly animationQueue: readonly AnimationEvent[];
}

export function buildTurnResolutionResult(
  nextTurnNonce: string,
  snapshot: BattleSnapshot,
  events: readonly AnimationEvent[]
): TurnResolutionResult {
  return {
    nextTurnNonce,
    updatedCharacters: snapshot.entities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      hp: entity.stats.hp,
      maxHp: entity.stats.maxHp,
      actionGauge: entity.actionGauge,
      speed: entity.stats.speed,
    })),
    animationQueue: events,
  };
}
