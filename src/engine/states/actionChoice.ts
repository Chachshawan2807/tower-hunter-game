import {
  findEntity,
  getOpponents,
  type BattleAction,
  type BattleState,
} from "./battleState";

/**
 * Phase 2 — Action Choice:
 * Auto AI selects lowest-HP opponent when enabled.
 * Returns null when manual input is required.
 */
export function resolveActionChoice(
  state: BattleState,
  actorId: string,
  manualAction?: BattleAction
): BattleAction | null {
  if (manualAction) {
    return manualAction;
  }

  const actor = findEntity(state, actorId);
  if (!actor) return null;

  const requiresManualInput =
    actor.side === "player" && !state.autoBattle;

  if (requiresManualInput) {
    return null;
  }

  const targets = getOpponents(state, actor);
  if (targets.length === 0) return null;

  const target = targets.reduce((lowest, current) =>
    current.stats.hp < lowest.stats.hp ? current : lowest
  );

  return {
    type: "basic_attack",
    targetId: target.id,
  };
}

export function validateManualAction(
  state: BattleState,
  actorId: string,
  action: BattleAction
): boolean {
  const actor = findEntity(state, actorId);
  const target = findEntity(state, action.targetId);

  if (!actor || !target) return false;
  if (actor.stats.hp <= 0 || target.stats.hp <= 0) return false;

  const validTargets = getOpponents(state, actor);
  return validTargets.some((t) => t.id === action.targetId);
}
