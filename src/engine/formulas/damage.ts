import type { StatValue } from "../types";
import { defToPercent } from "./defPercent";

/**
 * Final Damage = max(1, ATK * (1 - Target DEF Percent))
 * Minimum damage is always 1, never 0.
 */
export function calculateBaseDamage(
  attackerAtk: StatValue,
  targetDef: StatValue
): StatValue {
  const defPercent = defToPercent(targetDef);
  const raw = attackerAtk * (1 - defPercent);
  return Math.ceil(Math.max(1, raw));
}
