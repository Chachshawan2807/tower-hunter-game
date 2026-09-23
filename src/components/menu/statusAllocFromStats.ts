import {
  allocationColumnForStat,
  emptyStatusAllocations,
  mergedPlayerStatsFromAllocations,
  STATUS_POINT_COST,
  STATUS_POINT_DELTAS,
  totalAllocatedStatusPoints,
  type StatusAllocations,
  type StatusStatKey,
} from "../../engine/formulas/statusPoints";
import type { PlayerStatsResponse } from "../../utils/api";

type PlayerStats = NonNullable<PlayerStatsResponse["stats"]>;

const ALLOC_DB_FIELD: Record<
  StatusStatKey,
  keyof Pick<
    PlayerStats,
    | "alloc_hp"
    | "alloc_mp"
    | "alloc_atk"
    | "alloc_def"
    | "alloc_spd"
    | "alloc_crit"
    | "alloc_crit_dmg"
    | "alloc_resist"
    | "alloc_eva"
    | "alloc_acc"
  >
> = {
  hp: "alloc_hp",
  mp: "alloc_mp",
  atk: "alloc_atk",
  def: "alloc_def",
  spd: "alloc_spd",
  crit: "alloc_crit",
  crit_dmg: "alloc_crit_dmg",
  resist: "alloc_resist",
  eva: "alloc_eva",
  acc: "alloc_acc",
};

function readAllocations(stats: PlayerStats): StatusAllocations {
  return {
    hp: stats.alloc_hp ?? 0,
    mp: stats.alloc_mp ?? 0,
    atk: stats.alloc_atk ?? 0,
    def: stats.alloc_def ?? 0,
    spd: stats.alloc_spd ?? 0,
    crit: stats.alloc_crit ?? 0,
    critDmg: stats.alloc_crit_dmg ?? 0,
    resist: stats.alloc_resist ?? 0,
    eva: stats.alloc_eva ?? 0,
    acc: stats.alloc_acc ?? 0,
  };
}

/** Client-side mirror of server allocateStatusPoint for instant UI feedback. */
export function optimisticStatusAllocate(
  stats: PlayerStats,
  stat: StatusStatKey
): PlayerStats {
  const statusPoints = stats.status_points ?? 0;
  if (statusPoints < STATUS_POINT_COST) {
    return stats;
  }

  const allocations = readAllocations(stats);
  const allocColumn = allocationColumnForStat(stat);
  const nextAllocations: StatusAllocations = {
    ...allocations,
    [allocColumn]: allocations[allocColumn] + 1,
  };
  const merged = mergedPlayerStatsFromAllocations(stats.level, nextAllocations);
  const delta = STATUS_POINT_DELTAS[stat];
  const hpGain = delta.maxHp ?? 0;
  const mpGain = delta.maxMp ?? 0;
  const allocField = ALLOC_DB_FIELD[stat];

  return {
    ...stats,
    status_points: statusPoints - STATUS_POINT_COST,
    [allocField]: (stats[allocField] ?? 0) + 1,
    max_hp: String(merged.maxHp),
    max_mp: String(merged.maxMp),
    atk: String(merged.atk),
    def: String(merged.def),
    speed: String(merged.speed),
    crit_chance: String(merged.critChance),
    crit_damage: String(merged.critDamage),
    status_resist: String(merged.statusResist),
    evasion: String(merged.evasion),
    accuracy: String(merged.accuracy),
    hp: hpGain > 0 ? String(Number(stats.hp) + hpGain) : stats.hp,
    mp: mpGain > 0 ? String(Number(stats.mp) + mpGain) : stats.mp,
  };
}

/** Client-side mirror of server resetStatusAllocations for instant UI feedback. */
export function optimisticStatusReset(stats: PlayerStats): PlayerStats {
  const allocations = readAllocations(stats);
  const refund = totalAllocatedStatusPoints(allocations);
  if (refund <= 0) {
    return stats;
  }

  const merged = mergedPlayerStatsFromAllocations(
    stats.level,
    emptyStatusAllocations()
  );
  const nextHp = Math.min(Number(stats.hp), merged.maxHp);
  const nextMp = Math.min(Number(stats.mp), merged.maxMp);

  return {
    ...stats,
    status_points: (stats.status_points ?? 0) + refund,
    alloc_hp: 0,
    alloc_mp: 0,
    alloc_atk: 0,
    alloc_def: 0,
    alloc_spd: 0,
    alloc_crit: 0,
    alloc_crit_dmg: 0,
    alloc_resist: 0,
    alloc_eva: 0,
    alloc_acc: 0,
    max_hp: String(merged.maxHp),
    max_mp: String(merged.maxMp),
    atk: String(merged.atk),
    def: String(merged.def),
    speed: String(merged.speed),
    crit_chance: String(merged.critChance),
    crit_damage: String(merged.critDamage),
    status_resist: String(merged.statusResist),
    evasion: String(merged.evasion),
    accuracy: String(merged.accuracy),
    hp: String(nextHp),
    mp: String(nextMp),
  };
}
