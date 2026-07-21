import {
  canUseSkill,
  getSkillById,
  normalizeSkillId,
  pickSkillForTurn,
} from "../skills";
import { pickEnemySkill } from "../skills/enemyAi";
import { resolveEnemyTemplate } from "../skills/enemyTemplates";
import { isSkillUnlocked } from "../skills/skillUnlock";
import { resolveEffectiveSkill } from "../skills/effectiveSkill";
import { EMPTY_SKILL_UPGRADES } from "../skills/types";
import {
  findEntity,
  getOpponents,
  type BattleAction,
  type BattleState,
} from "./battleState";

export function resolveActionChoice(
  state: BattleState,
  actorId: string,
  manualAction?: BattleAction
): BattleAction | null {
  if (manualAction) {
    const skillId = normalizeSkillId(manualAction.skillId ?? "basic_attack");
    return { ...manualAction, skillId };
  }

  const actor = findEntity(state, actorId);
  if (!actor) return null;

  if (actor.side === "player" && !state.autoBattle) {
    return null;
  }

  const targets = getOpponents(state, actor);
  if (targets.length === 0) return null;

  const target = targets.reduce((lowest, current) =>
    current.stats.hp < lowest.stats.hp ? current : lowest
  );

  let skillId: string;

  if (actor.side === "player") {
    const skill = pickSkillForTurn(
      actor,
      state.playerLoadout,
      state.playerSkillUpgrades,
      state.playerUnlockedSkillIds
    );
    skillId = skill.id;
    if (skill.targetType === "self") {
      return { type: "basic_attack", targetId: actor.id, skillId };
    }
  } else {
    const template = resolveEnemyTemplate(state.floor);
    const skill = pickEnemySkill(actor, template, Math.random);
    skillId = skill.id;
    if (skill.targetType === "self") {
      return { type: "basic_attack", targetId: actor.id, skillId };
    }
  }

  return {
    type: "basic_attack",
    targetId: target.id,
    skillId,
  };
}

export function validateManualAction(
  state: BattleState,
  actorId: string,
  action: BattleAction
): boolean {
  const actor = findEntity(state, actorId);
  if (!actor) return false;

  const skillId = normalizeSkillId(action.skillId ?? "basic_attack");
  const resolved = resolveEffectiveSkill(
    getSkillById(skillId),
    state.playerSkillUpgrades[skillId] ?? EMPTY_SKILL_UPGRADES
  );

  if (skillId !== "basic_attack") {
    const equipped = state.playerLoadout.equippedSlots.map(normalizeSkillId);
    if (!equipped.includes(skillId)) return false;
    if (!isSkillUnlocked(resolved, state.playerUnlockedSkillIds)) return false;
    if (!canUseSkill(actor, resolved, state.playerUnlockedSkillIds)) {
      return false;
    }
  }

  if (resolved.targetType === "self") {
    return action.targetId === actorId;
  }

  const target = findEntity(state, action.targetId);
  if (!target) return false;
  if (actor.stats.hp <= 0 || target.stats.hp <= 0) return false;

  const validTargets = getOpponents(state, actor);
  return validTargets.some((t) => t.id === action.targetId);
}
