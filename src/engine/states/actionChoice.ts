import {
  canUseSkill,
  deriveAutoSkills,
  getSkillById,
  getSkillsForPath,
  isSkillUnlocked,
  pickAutoSkill,
  pickEnemySkill,
  resolveEnemyTemplate,
  resolveSkillId,
} from "../skills";
import {
  findEntity,
  getOpponents,
  type BattleAction,
  type BattleState,
} from "./battleState";

/**
 * Phase 2 — Action Choice:
 * Auto AI picks best usable skill (level unlock + cooldown + MP).
 */
export function resolveActionChoice(
  state: BattleState,
  actorId: string,
  manualAction?: BattleAction
): BattleAction | null {
  if (manualAction) {
    const skillId = resolveSkillId(
      manualAction.skillId,
      state.playerSkillPath
    );
    return { ...manualAction, skillId };
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

  let skillId = "basic_attack";

  if (actor.side === "player") {
    const { activeSlots } = state.playerLoadout;
    const unlocked = getSkillsForPath(state.playerSkillPath)
      .filter((s) => isSkillUnlocked(s, state.playerUnlockedSkillIds))
      .map((s) => s.id);

    const autoIds = deriveAutoSkills(unlocked, activeSlots);
    const skillPool = state.autoBattle
      ? [...new Set([...activeSlots, ...autoIds])]
      : autoIds;

    const skill = pickAutoSkill(
      actor,
      state.playerSkillPath,
      skillPool,
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

  const skillId = resolveSkillId(action.skillId, state.playerSkillPath);
  const resolved = getSkillById(skillId);

  if (
    skillId !== "basic_attack" &&
    !state.playerLoadout.activeSlots.includes(skillId)
  ) {
    return false;
  }

  if (
    skillId !== "basic_attack" &&
    !canUseSkill(actor, resolved, state.playerUnlockedSkillIds)
  ) {
    return false;
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
