import type { AnimationEvent, BattleSnapshot } from "../types";

const HP_DELTA_TYPES = new Set<AnimationEvent["type"]>([
  "damage",
  "dot_damage",
  "heal",
]);

function cloneSnapshot(snapshot: BattleSnapshot): BattleSnapshot {
  return {
    ...snapshot,
    entities: snapshot.entities.map((entity) => ({
      ...entity,
      stats: { ...entity.stats },
      statusEffects: [...entity.statusEffects],
      skillCooldowns: { ...entity.skillCooldowns },
    })),
  };
}

function resolveTargetId(event: AnimationEvent): string | undefined {
  if (event.targetId) return event.targetId;
  if (event.type === "dot_damage" || event.type === "heal") {
    return event.actorId;
  }
  return undefined;
}

/**
 * Reconstructs entity HP before a batch of animation events (e.g. first client step).
 */
export function baselineSnapshotBeforeEvents(
  finalState: BattleSnapshot,
  events: readonly AnimationEvent[]
): BattleSnapshot {
  const baseline = cloneSnapshot(finalState);
  const byId = new Map(baseline.entities.map((entity) => [entity.id, entity]));

  for (const event of events) {
    if (!HP_DELTA_TYPES.has(event.type)) continue;
    const delta = event.value;
    if (delta === undefined || delta <= 0) continue;

    const targetId = resolveTargetId(event);
    if (!targetId) continue;

    const target = byId.get(targetId);
    if (!target) continue;

    if (event.type === "heal") {
      target.stats.hp = Math.max(0, target.stats.hp - delta);
    } else {
      target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + delta);
    }
  }

  return baseline;
}

/**
 * Applies combat HP deltas from animation events onto a snapshot baseline.
 * Used by the battle view while the animation queue plays.
 */
export function projectSnapshotHpFromEvents(
  baseline: BattleSnapshot,
  events: readonly AnimationEvent[]
): BattleSnapshot {
  const projected = cloneSnapshot(baseline);
  const byId = new Map(projected.entities.map((entity) => [entity.id, entity]));

  for (const event of events) {
    if (!HP_DELTA_TYPES.has(event.type)) continue;
    const delta = event.value;
    if (delta === undefined || delta <= 0) continue;

    const targetId = resolveTargetId(event);
    if (!targetId) continue;

    const target = byId.get(targetId);
    if (!target) continue;

    if (event.type === "heal") {
      target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + delta);
    } else {
      target.stats.hp = Math.max(0, target.stats.hp - delta);
    }
  }

  return projected;
}
