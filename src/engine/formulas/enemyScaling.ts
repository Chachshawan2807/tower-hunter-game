import { ENEMY_EXPONENT_BASE, type EnemyBaseStats, type StatValue } from "../types";

/**
 * Exponential scaling for HP, ATK, DEF:
 * Stat_Floor = Base_Stat * (1.08 ^ (Floor - 1))
 */
export function scaleExponentialStat(
  baseStat: StatValue,
  floor: StatValue
): StatValue {
  if (floor <= 1) return baseStat;
  return baseStat * Math.pow(ENEMY_EXPONENT_BASE, floor - 1);
}

/**
 * Linear scaling for Speed, Accuracy, Evasion to prevent turn-order abuse.
 */
export function scaleLinearStat(
  baseStat: StatValue,
  floor: StatValue,
  perFloorIncrement: StatValue
): StatValue {
  if (floor <= 1) return baseStat;
  return baseStat + perFloorIncrement * (floor - 1);
}

export interface LinearScalingConfig {
  speedIncrement: StatValue;
  accuracyIncrement: StatValue;
  evasionIncrement: StatValue;
}

export const DEFAULT_LINEAR_SCALING: LinearScalingConfig = {
  speedIncrement: 0.5,
  accuracyIncrement: 1,
  evasionIncrement: 0.5,
};

export function scaleEnemyStatsForFloor(
  base: EnemyBaseStats,
  floor: StatValue,
  linear: LinearScalingConfig = DEFAULT_LINEAR_SCALING
): EnemyBaseStats {
  return {
    hp: scaleExponentialStat(base.hp, floor),
    atk: scaleExponentialStat(base.atk, floor),
    def: scaleExponentialStat(base.def, floor),
    speed: scaleLinearStat(base.speed, floor, linear.speedIncrement),
    accuracy: scaleLinearStat(base.accuracy, floor, linear.accuracyIncrement),
    evasion: scaleLinearStat(base.evasion, floor, linear.evasionIncrement),
  };
}
