export const TOWER_TOTAL_FLOORS = 100;

/** Width scale (%) — wider toward the base, like the nav tower icon silhouette. */
export function towerTierWidthPercent(
  floor: number,
  total = TOWER_TOTAL_FLOORS
): number {
  const min = 36;
  const max = 100;
  if (total <= 1) return max;
  return min + ((floor - 1) / (total - 1)) * (max - min);
}
