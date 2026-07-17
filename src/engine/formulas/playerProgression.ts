import type { CombatStats } from "../types";

/** Per-level growth rate — slightly below enemy floor scaling (1.08). */
export const PLAYER_STAT_GROWTH_BASE = 1.06;

const BASE_STATS = {
  maxHp: 500,
  maxMp: 100,
  atk: 50,
  def: 20,
  speed: 100,
};

export function expToNextLevel(currentLevel: number): number {
  return 30 + 5 * currentLevel;
}

export function totalExpForLevel(level: number): number {
  if (level <= 1) return 0;

  let total = 0;
  for (let lv = 1; lv < level; lv++) {
    total += expToNextLevel(lv);
  }
  return total;
}

export function levelFromTotalExp(totalExp: number): number {
  let level = 1;

  while (totalExpForLevel(level + 1) <= totalExp) {
    level++;
  }

  return level;
}

/** 0–1 progress toward next level for HUD EXP gauge §08 */
export function expProgressRatio(level: number, totalExp: number): number {
  const { current, needed } = expTowardNextLevel(level, totalExp);
  if (needed <= 0) return 1;
  return Math.min(1, current / needed);
}

export function expTowardNextLevel(
  level: number,
  totalExp: number
): { current: number; needed: number } {
  const safeLevel = Math.max(1, Math.floor(level));
  const base = totalExpForLevel(safeLevel);
  const needed = expToNextLevel(safeLevel);
  const current = Math.max(0, totalExp - base);
  return { current, needed };
}

function scalePlayerStat(baseStat: number, level: number): number {
  if (level <= 1) return baseStat;
  return Math.floor(baseStat * Math.pow(PLAYER_STAT_GROWTH_BASE, level - 1));
}

export function combatStatsForLevel(level: number): Pick<
  CombatStats,
  "level" | "maxHp" | "maxMp" | "atk" | "def" | "speed"
> {
  const safeLevel = Math.max(1, Math.floor(level));

  return {
    level: safeLevel,
    maxHp: scalePlayerStat(BASE_STATS.maxHp, safeLevel),
    maxMp: scalePlayerStat(BASE_STATS.maxMp, safeLevel),
    atk: scalePlayerStat(BASE_STATS.atk, safeLevel),
    def: scalePlayerStat(BASE_STATS.def, safeLevel),
    speed: BASE_STATS.speed + (safeLevel - 1) * 2,
  };
}
