import type { StatValue, StatusEffect } from "../types";
import { isStatModifier } from "../types";

export interface EffectiveStats {
  atk: StatValue;
  def: StatValue;
}

/**
 * Applies active ATK/DEF buff and debuff modifiers to effective combat stats.
 * Buff: +20% / Debuff: -25% (default magnitudes stored on StatusEffect).
 */
export function applyStatModifiers(
  baseAtk: StatValue,
  baseDef: StatValue,
  effects: StatusEffect[]
): EffectiveStats {
  let atkMultiplier = 1;
  let defMultiplier = 1;

  for (const effect of effects) {
    if (!isStatModifier(effect.type) || effect.magnitude === undefined) {
      continue;
    }

    switch (effect.type) {
      case "atk_buff":
        atkMultiplier += effect.magnitude;
        break;
      case "atk_debuff":
        atkMultiplier += effect.magnitude;
        break;
      case "def_buff":
        defMultiplier += effect.magnitude;
        break;
      case "def_debuff":
        defMultiplier += effect.magnitude;
        break;
    }
  }

  return {
    atk: Math.max(0, baseAtk * atkMultiplier),
    def: Math.max(0, baseDef * defMultiplier),
  };
}

/**
 * Decrements remaining turns on all status effects by 1 at end of turn.
 * Removes effects that reach 0 turns.
 */
export function tickStatusEffects(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map((e) => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
    .filter((e) => e.remainingTurns > 0);
}
