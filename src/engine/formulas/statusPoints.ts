import type { CombatStats } from "../types";
import { combatStatsForLevel } from "./playerProgression";

export type StatusStatKey =
  | "hp"
  | "mp"
  | "atk"
  | "def"
  | "spd"
  | "crit"
  | "crit_dmg"
  | "resist"
  | "eva"
  | "acc";

export interface StatusAllocations {
  hp: number;
  mp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  critDmg: number;
  resist: number;
  eva: number;
  acc: number;
}

export interface SecondaryPlayerStats {
  critChance: number;
  critDamage: number;
  statusResist: number;
  evasion: number;
  accuracy: number;
}

export interface MergedPlayerBaseStats extends SecondaryPlayerStats {
  level: number;
  maxHp: number;
  maxMp: number;
  atk: number;
  def: number;
  speed: number;
}

export const STATUS_STAT_KEYS: StatusStatKey[] = [
  "hp",
  "mp",
  "atk",
  "def",
  "spd",
  "crit",
  "crit_dmg",
  "resist",
  "eva",
  "acc",
];

const ALLOC_COLUMN: Record<StatusStatKey, keyof StatusAllocations> = {
  hp: "hp",
  mp: "mp",
  atk: "atk",
  def: "def",
  spd: "spd",
  crit: "crit",
  crit_dmg: "critDmg",
  resist: "resist",
  eva: "eva",
  acc: "acc",
};

export const STATUS_POINT_COST = 1;
export const STATUS_POINTS_PER_LEVEL_UP = 5;

/** Level-1 secondary stats (schema defaults; no per-level scaling yet). */
export const BASE_SECONDARY_PLAYER_STATS: SecondaryPlayerStats = {
  critChance: 0.1,
  critDamage: 1.5,
  statusResist: 0.05,
  evasion: 10,
  accuracy: 100,
};

type PrimaryDelta = Partial<
  Pick<CombatStats, "maxHp" | "maxMp" | "atk" | "def" | "speed">
>;
type SecondaryDelta = Partial<SecondaryPlayerStats>;

/** +1 display unit per allocated point (%, flat, or whole number as shown in UI). */
export const STATUS_POINT_DELTAS: Record<
  StatusStatKey,
  PrimaryDelta & SecondaryDelta
> = {
  hp: { maxHp: 1 },
  mp: { maxMp: 1 },
  atk: { atk: 1 },
  def: { def: 1 },
  spd: { speed: 1 },
  crit: { critChance: 0.01 },
  crit_dmg: { critDamage: 0.01 },
  resist: { statusResist: 0.01 },
  eva: { evasion: 1 },
  acc: { accuracy: 1 },
};

export function calculateStatusPointGrant(
  oldLevel: number,
  newLevel: number
): number {
  const levelsGained = Math.max(0, newLevel - oldLevel);
  return levelsGained * STATUS_POINTS_PER_LEVEL_UP;
}

export function emptyStatusAllocations(): StatusAllocations {
  return {
    hp: 0,
    mp: 0,
    atk: 0,
    def: 0,
    spd: 0,
    crit: 0,
    critDmg: 0,
    resist: 0,
    eva: 0,
    acc: 0,
  };
}

export function totalAllocatedStatusPoints(allocations: StatusAllocations): number {
  return STATUS_STAT_KEYS.reduce(
    (sum, key) => sum + allocations[ALLOC_COLUMN[key]],
    0
  );
}

export function statusBonusesFromAllocations(
  allocations: StatusAllocations
): Pick<CombatStats, "maxHp" | "maxMp" | "atk" | "def" | "speed"> {
  const bonus = {
    maxHp: 0,
    maxMp: 0,
    atk: 0,
    def: 0,
    speed: 0,
  };

  for (const key of STATUS_STAT_KEYS) {
    const rank = allocations[ALLOC_COLUMN[key]];
    if (rank <= 0) continue;
    const delta = STATUS_POINT_DELTAS[key];
    bonus.maxHp += (delta.maxHp ?? 0) * rank;
    bonus.maxMp += (delta.maxMp ?? 0) * rank;
    bonus.atk += (delta.atk ?? 0) * rank;
    bonus.def += (delta.def ?? 0) * rank;
    bonus.speed += (delta.speed ?? 0) * rank;
  }

  return bonus;
}

export function secondaryBonusesFromAllocations(
  allocations: StatusAllocations
): SecondaryPlayerStats {
  const bonus: SecondaryPlayerStats = {
    critChance: 0,
    critDamage: 0,
    statusResist: 0,
    evasion: 0,
    accuracy: 0,
  };

  for (const key of STATUS_STAT_KEYS) {
    const rank = allocations[ALLOC_COLUMN[key]];
    if (rank <= 0) continue;
    const delta = STATUS_POINT_DELTAS[key];
    bonus.critChance += (delta.critChance ?? 0) * rank;
    bonus.critDamage += (delta.critDamage ?? 0) * rank;
    bonus.statusResist += (delta.statusResist ?? 0) * rank;
    bonus.evasion += (delta.evasion ?? 0) * rank;
    bonus.accuracy += (delta.accuracy ?? 0) * rank;
  }

  return bonus;
}

export function playerStatsWithStatusAllocations(
  level: number,
  allocations: StatusAllocations
): Pick<CombatStats, "level" | "maxHp" | "maxMp" | "atk" | "def" | "speed"> {
  const base = combatStatsForLevel(level);
  const bonus = statusBonusesFromAllocations(allocations);

  return {
    level: base.level,
    maxHp: base.maxHp + bonus.maxHp,
    maxMp: base.maxMp + bonus.maxMp,
    atk: base.atk + bonus.atk,
    def: base.def + bonus.def,
    speed: base.speed + bonus.speed,
  };
}

export function mergedPlayerStatsFromAllocations(
  level: number,
  allocations: StatusAllocations
): MergedPlayerBaseStats {
  const primary = playerStatsWithStatusAllocations(level, allocations);
  const secondaryBonus = secondaryBonusesFromAllocations(allocations);
  const base = BASE_SECONDARY_PLAYER_STATS;

  return {
    ...primary,
    critChance: base.critChance + secondaryBonus.critChance,
    critDamage: base.critDamage + secondaryBonus.critDamage,
    statusResist: base.statusResist + secondaryBonus.statusResist,
    evasion: base.evasion + secondaryBonus.evasion,
    accuracy: base.accuracy + secondaryBonus.accuracy,
  };
}

export function isStatusStatKey(value: string): value is StatusStatKey {
  return STATUS_STAT_KEYS.includes(value as StatusStatKey);
}

export function allocationColumnForStat(stat: StatusStatKey): keyof StatusAllocations {
  return ALLOC_COLUMN[stat];
}
