import type { StatValue } from "../types";

export interface CriticalResult {
  isCritical: boolean;
  finalDamage: StatValue;
}

/**
 * Critical is checked only after a successful hit.
 * On crit, base damage is multiplied by crit damage (after crit resist reduction).
 */
export function calculateCriticalDamage(
  baseDamage: StatValue,
  critDamage: StatValue,
  critResist: StatValue
): StatValue {
  const effectiveMultiplier = Math.max(1, critDamage - critResist);
  return baseDamage * effectiveMultiplier;
}

export function rollCritical(
  baseDamage: StatValue,
  critChance: StatValue,
  critDamage: StatValue,
  critResist: StatValue,
  rng: () => number = Math.random
): CriticalResult {
  const effectiveCritChance = Math.max(0, critChance - critResist);
  const isCritical = rng() < effectiveCritChance;

  return {
    isCritical,
    finalDamage: isCritical
      ? calculateCriticalDamage(baseDamage, critDamage, critResist)
      : baseDamage,
  };
}
