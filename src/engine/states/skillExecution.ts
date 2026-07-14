import { resolveAttackWithModifiers } from "../formulas/attackResolution";
import {
  applySkillCooldown,
  canUseSkill,
  getSkillById,
  resolveEffectiveSkill,
} from "../skills";
import type { SkillDefinition } from "../skills/types";
import { applyStatusOnHit } from "../status";
import type { AnimationEvent, BattleEntity, StatusEffect } from "../types";
import {
  checkBattleOutcome,
  findEntity,
  updateEntity,
  type BattleAction,
  type BattleState,
} from "./battleState";

export interface ExecutionResult {
  state: BattleState;
  events: AnimationEvent[];
}

function deductMpAndCooldown(
  entity: BattleEntity,
  skill: SkillDefinition
): BattleEntity {
  return {
    ...entity,
    stats: {
      ...entity.stats,
      mp: Math.max(0, entity.stats.mp - skill.mpCost),
    },
    skillCooldowns: applySkillCooldown(entity.skillCooldowns, skill),
  };
}

function applySelfStatus(
  entity: BattleEntity,
  status: NonNullable<SkillDefinition["selfStatus"]>,
  sourceId: string
): StatusEffect[] {
  const filtered = entity.statusEffects.filter((e) => e.type !== status.type);
  return [
    ...filtered,
    {
      type: status.type,
      remainingTurns: status.turns,
      magnitude: status.magnitude,
      sourceId,
    },
  ];
}

function pierceDef(def: number, pierce: number): number {
  return def * (1 - Math.min(0.9, Math.max(0, pierce)));
}

function executeAttackSkill(
  state: BattleState,
  actor: BattleEntity,
  target: BattleEntity,
  skill: SkillDefinition,
  rng: () => number
): ExecutionResult {
  const events: AnimationEvent[] = [];
  const accuracyBonus = skill.accuracyBonus ?? 0;
  const damageMultiplier = skill.damageMultiplier ?? 1;
  const defPierce = skill.defPierce ?? 0;

  const attackerInput = {
    baseStats: {
      atk: actor.stats.atk * damageMultiplier,
      def: actor.stats.def,
      accuracy: actor.stats.accuracy + accuracyBonus,
      evasion: actor.stats.evasion,
      critChance: actor.stats.critChance,
      critDamage: actor.stats.critDamage,
      critResist: actor.stats.critResist,
    },
    statusEffects: actor.statusEffects,
  };

  const targetDef = pierceDef(target.stats.def, defPierce);
  const targetInput = {
    baseStats: {
      atk: target.stats.atk,
      def: targetDef,
      accuracy: target.stats.accuracy,
      evasion: target.stats.evasion,
      critChance: target.stats.critChance,
      critDamage: target.stats.critDamage,
      critResist: target.stats.critResist,
    },
    statusEffects: target.statusEffects,
  };

  const result = resolveAttackWithModifiers(attackerInput, targetInput, rng);

  if (!result.hit) {
    events.push({ type: "miss", actorId: actor.id, targetId: target.id });
    const nextState = updateEntity(state, actor.id, () =>
      deductMpAndCooldown(actor, skill)
    );
    return { state: nextState, events };
  }

  if (result.isCritical) {
    events.push({
      type: "critical",
      actorId: actor.id,
      targetId: target.id,
      value: result.damage,
    });
  }

  events.push({
    type: "damage",
    actorId: actor.id,
    targetId: target.id,
    value: result.damage,
  });

  const statusResult = applyStatusOnHit(actor, target, rng, skill);
  events.push(...statusResult.events);

  let nextState = updateEntity(state, actor.id, () =>
    deductMpAndCooldown(actor, skill)
  );

  nextState = updateEntity(nextState, target.id, (entity) => ({
    ...entity,
    stats: {
      ...entity.stats,
      hp: Math.max(0, entity.stats.hp - result.damage),
    },
    statusEffects: statusResult.statusEffects,
  }));

  nextState = checkBattleOutcome(nextState);
  return { state: nextState, events };
}

function executeSelfSkill(
  state: BattleState,
  actor: BattleEntity,
  skill: SkillDefinition
): ExecutionResult {
  const events: AnimationEvent[] = [];
  let updatedActor = deductMpAndCooldown(actor, skill);

  if (skill.kind === "heal" && skill.healPercent) {
    const healAmount = Math.floor(actor.stats.maxHp * skill.healPercent);
    const newHp = Math.min(actor.stats.maxHp, actor.stats.hp + healAmount);
    updatedActor = {
      ...updatedActor,
      stats: { ...updatedActor.stats, hp: newHp },
    };
    events.push({
      type: "heal",
      actorId: actor.id,
      value: newHp - actor.stats.hp,
    });
  }

  if (skill.selfStatus) {
    updatedActor = {
      ...updatedActor,
      statusEffects: applySelfStatus(
        updatedActor,
        skill.selfStatus,
        actor.id
      ),
    };
    events.push({
      type: "buff_apply",
      actorId: actor.id,
      metadata: { effectType: skill.selfStatus.type, skillId: skill.id },
    });
  }

  const nextState = updateEntity(state, actor.id, () => updatedActor);
  return { state: nextState, events };
}

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
  const playerLevel = actor.stats.level;

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
    !canUseSkill(actor, skill, playerLevel)
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
