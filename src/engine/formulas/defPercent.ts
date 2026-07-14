import type { StatValue } from "../types";

/** DEF diminishing-returns constant for percent conversion. */
export const DEF_SCALING_CONSTANT = 100;

/**
 * Converts raw DEF into a damage reduction percentage (0–1).
 * Higher DEF asymptotically approaches 1 but never fully negates damage alone.
 */
export function defToPercent(def: StatValue): StatValue {
  if (def <= 0) return 0;
  return def / (def + DEF_SCALING_CONSTANT);
}
