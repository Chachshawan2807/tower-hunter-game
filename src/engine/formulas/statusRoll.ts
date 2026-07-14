import type { StatValue } from "../types";

export const BASE_STATUS_CHANCE = 0.15;
export const MIN_STATUS_CHANCE = 0.02;
export const MAX_STATUS_CHANCE = 0.6;

/**
 * Status proc chance from attacker statusChance minus target statusResist.
 */
export function calculateStatusProcChance(
  statusChance: StatValue,
  statusResist: StatValue
): StatValue {
  const raw = BASE_STATUS_CHANCE + statusChance - statusResist;
  return Math.min(MAX_STATUS_CHANCE, Math.max(MIN_STATUS_CHANCE, raw));
}

export function rollStatusProc(
  statusChance: StatValue,
  statusResist: StatValue,
  rng: () => number = Math.random
): boolean {
  return rng() < calculateStatusProcChance(statusChance, statusResist);
}
