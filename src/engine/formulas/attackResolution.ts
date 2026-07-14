import type { StatValue, StatusEffect } from "../types";
import { calculateBaseDamage } from "./damage";
import { rollCritical } from "./critical";
import { rollHit } from "./hitChance";
import { applyStatModifiers } from "./statusEffects";

export interface AttackResolutionInput {
  attackerAtk: StatValue;
  attackerAccuracy: StatValue;
  attackerCritChance: StatValue;
  attackerCritDamage: StatValue;
  targetDef: StatValue;
  targetEvasion: StatValue;
  targetCritResist: StatValue;
}

export interface AttackResolutionResult {
  hit: boolean;
  isCritical: boolean;
  damage: StatValue;
}

/**
 * Full attack pipeline: Hit → Crit (if hit) → DEF reduction → final damage.
 * Execution phase runs entirely server-side.
 */
export function resolveAttack(
  input: AttackResolutionInput,
  rng: () => number = Math.random
): AttackResolutionResult {
  const hit = rollHit(input.attackerAccuracy, input.targetEvasion, rng);

  if (!hit) {
    return { hit: false, isCritical: false, damage: 0 };
  }

  const baseDamage = calculateBaseDamage(input.attackerAtk, input.targetDef);
  const crit = rollCritical(
    baseDamage,
    input.attackerCritChance,
    input.attackerCritDamage,
    input.targetCritResist,
    rng
  );

  return {
    hit: true,
    isCritical: crit.isCritical,
    damage: crit.finalDamage,
  };
}

export interface EffectiveCombatInput {
  baseStats: {
    atk: StatValue;
    def: StatValue;
    accuracy: StatValue;
    evasion: StatValue;
    critChance: StatValue;
    critDamage: StatValue;
    critResist: StatValue;
  };
  statusEffects: StatusEffect[];
}

/**
 * Resolves an attack using buff/debuff-adjusted effective stats.
 */
export function resolveAttackWithModifiers(
  attacker: EffectiveCombatInput,
  target: EffectiveCombatInput,
  rng: () => number = Math.random
): AttackResolutionResult {
  const atkMods = applyStatModifiers(
    attacker.baseStats.atk,
    attacker.baseStats.def,
    attacker.statusEffects
  );
  const defMods = applyStatModifiers(
    target.baseStats.atk,
    target.baseStats.def,
    target.statusEffects
  );

  return resolveAttack(
    {
      attackerAtk: atkMods.atk,
      attackerAccuracy: attacker.baseStats.accuracy,
      attackerCritChance: attacker.baseStats.critChance,
      attackerCritDamage: attacker.baseStats.critDamage,
      targetDef: defMods.def,
      targetEvasion: target.baseStats.evasion,
      targetCritResist: target.baseStats.critResist,
    },
    rng
  );
}
