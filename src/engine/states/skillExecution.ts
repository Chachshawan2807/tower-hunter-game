import {
  canUseSkill,
  getSkillById,
  resolveEffectiveSkill,
} from "../skills";
import type { AnimationEvent } from "../types";
import {
  findEntity,
  type BattleAction,
  type BattleState,
} from "./battleState";
import {
  executeAttackSkill,
  executeSelfSkill,
  type ExecutionResult,
} from "./skillExecutionHelpers";

export type { ExecutionResult } from "./skillExecutionHelpers";

/**
 * Phase 3 — Execution:
 * Resolves skill or basic attack with MP cost, cooldown, and status effects.
 */
export function processExecution(
  state: BattleState,
  actorId: string,
  action: BattleAction,
  rng: () => number = Math.random
): ExecutionResult {
  const events: AnimationEvent[] = [];
  const actor = findEntity(state, actorId);
  const target = findEntity(state, action.targetId);

  if (!actor) {
    return { state, events };
  }

  let skill = getSkillById(action.skillId ?? "basic_attack");

  if (skill.id !== "basic_attack") {
    const upgrades = state.playerSkillUpgrades[skill.id] ?? {
      damage: 0,
      cooldown: 0,
      mpCost: 0,
    };
    skill = resolveEffectiveSkill(skill, upgrades);
  }

  if (
    skill.id !== "basic_attack" &&
    !canUseSkill(actor, skill, state.playerUnlockedSkillIds)
  ) {
    skill = getSkillById("basic_attack");
  }

  events.push({
    type: "attack",
    actorId,
    targetId: action.targetId,
    metadata: { skillId: skill.id },
  });

  if (skill.targetType === "self") {
    const selfResult = executeSelfSkill(state, actor, skill);
    return {
      state: selfResult.state,
      events: [...events, ...selfResult.events],
    };
  }

  if (!target) {
    return { state, events };
  }

  const attackResult = executeAttackSkill(state, actor, target, skill, rng);
  return {
    state: attackResult.state,
    events: [...events, ...attackResult.events],
  };
}
