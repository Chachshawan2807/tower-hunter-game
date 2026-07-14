import type { StatValue } from "../types";

export const BASE_HIT_CHANCE = 0.75;
export const MIN_HIT_CHANCE = 0.05;
export const MAX_HIT_CHANCE = 0.95;
export const HIT_DIMINISHING_FACTOR = 100;
export const HIT_BONUS_SCALE = 0.25;

/**
 * Hit Chance = f(Accuracy - Evasion) with diminishing returns
 * to prevent 100% evasion from being exploitable.
 */
export function calculateHitChance(
  accuracy: StatValue,
  evasion: StatValue
): StatValue {
  const diff = accuracy - evasion;
  const bonus =
    (diff / (Math.abs(diff) + HIT_DIMINISHING_FACTOR)) * HIT_BONUS_SCALE;
  const chance = BASE_HIT_CHANCE + bonus;
  return Math.min(MAX_HIT_CHANCE, Math.max(MIN_HIT_CHANCE, chance));
}

export function rollHit(
  accuracy: StatValue,
  evasion: StatValue,
  rng: () => number = Math.random
): boolean {
  return rng() < calculateHitChance(accuracy, evasion);
}
