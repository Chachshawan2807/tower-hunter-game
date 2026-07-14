import type { AnimationEvent, AnimationEventType } from "../types";
import type { AnimationState } from "./animationStates";

const ATTACK_EVENTS: ReadonlySet<AnimationEventType> = new Set([
  "attack",
  "critical",
  "damage",
]);

const HIT_EVENTS: ReadonlySet<AnimationEventType> = new Set([
  "damage",
  "critical",
  "cc_skip",
  "dot_damage",
]);

/**
 * Maps a battle animation-queue event to a character clip for one entity.
 */
export function mapEventToCharacterState(
  event: AnimationEvent,
  entityId: string,
  entitySide: "player" | "enemy"
): AnimationState | null {
  const isActor = event.actorId === entityId;
  const isTarget = event.targetId === entityId;

  if (event.type === "battle_win" && entitySide === "enemy") return "defeat";
  if (event.type === "battle_lose" && entitySide === "player") return "defeat";
  if (event.type === "battle_win" && isActor && entitySide === "player") return "attack";

  if (isActor && ATTACK_EVENTS.has(event.type)) return "attack";
  if (isTarget && HIT_EVENTS.has(event.type)) return "hit_cc";
  if (isActor && event.type === "cc_skip") return "hit_cc";

  return null;
}
