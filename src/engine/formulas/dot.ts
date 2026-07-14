import { DOT_HP_PERCENT, type StatValue } from "../types";

/**
 * DoT (poison / bleed): reduces HP by 5% of max HP per turn, lasts 3 turns.
 */
export function calculateDotDamage(
  maxHp: StatValue,
  percent: StatValue = DOT_HP_PERCENT
): StatValue {
  if (maxHp <= 0 || percent <= 0) return 0;
  return Math.ceil(Math.max(1, maxHp * percent));
}

export function applyDotDamage(
  currentHp: StatValue,
  dotDamage: StatValue
): StatValue {
  return Math.max(0, currentHp - dotDamage);
}
