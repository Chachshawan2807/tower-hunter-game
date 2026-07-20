import {
  allocationColumnForStat,
  BASE_SECONDARY_PLAYER_STATS,
  emptyStatusAllocations,
  isStatusStatKey,
  mergedPlayerStatsFromAllocations,
  STATUS_POINT_COST,
  STATUS_POINT_DELTAS,
  totalAllocatedStatusPoints,
  type StatusAllocations,
  type StatusStatKey,
} from "../../engine/formulas/statusPoints";
import { withTransaction, type DbPool } from "./client";
import {
  getPlayerStatsForUpdate,
  STATS_COLUMNS,
  type PlayerStatsRow,
} from "./playerStats";

export class StatusAllocationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_STAT"
      | "INSUFFICIENT_POINTS"
      | "STATS_NOT_FOUND"
      | "NOTHING_TO_RESET"
  ) {
    super(message);
    this.name = "StatusAllocationError";
  }
}

function readAllocations(row: PlayerStatsRow): StatusAllocations {
  return {
    hp: row.alloc_hp,
    mp: row.alloc_mp,
    atk: row.alloc_atk,
    def: row.alloc_def,
    spd: row.alloc_spd,
    crit: row.alloc_crit,
    critDmg: row.alloc_crit_dmg,
    resist: row.alloc_resist,
    eva: row.alloc_eva,
    acc: row.alloc_acc,
  };
}

const ALLOC_COLUMNS: Record<StatusStatKey, keyof PlayerStatsRow> = {
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

function formatMergedStats(merged: ReturnType<typeof mergedPlayerStatsFromAllocations>) {
  return {
    maxHp: merged.maxHp.toString(),
    maxMp: merged.maxMp.toString(),
    atk: merged.atk.toString(),
    def: merged.def.toString(),
    speed: merged.speed.toString(),
    critChance: merged.critChance.toString(),
    critDamage: merged.critDamage.toString(),
    statusResist: merged.statusResist.toString(),
    evasion: merged.evasion.toString(),
    accuracy: merged.accuracy.toString(),
  };
}

export async function allocateStatusPoint(
  pool: DbPool,
  userId: string,
  stat: string
): Promise<PlayerStatsRow> {
  if (!isStatusStatKey(stat)) {
    throw new StatusAllocationError("Invalid stat", "INVALID_STAT");
  }

  return withTransaction(pool, async (client) => {
    const stats = await getPlayerStatsForUpdate(client, userId);
    if (!stats) {
      throw new StatusAllocationError("Player stats not found", "STATS_NOT_FOUND");
    }

    if (stats.status_points < STATUS_POINT_COST) {
      throw new StatusAllocationError(
        "Insufficient status points",
        "INSUFFICIENT_POINTS"
      );
    }

    const allocations = readAllocations(stats);
    const allocColumn = ALLOC_COLUMNS[stat];
    const nextAllocations = {
      ...allocations,
      [allocationColumnForStat(stat)]: allocations[allocationColumnForStat(stat)] + 1,
    };
    const merged = mergedPlayerStatsFromAllocations(stats.level, nextAllocations);
    const formatted = formatMergedStats(merged);
    const delta = STATUS_POINT_DELTAS[stat];
    const hpGain = delta.maxHp ?? 0;
    const mpGain = delta.maxMp ?? 0;
    const nextHp = Number(stats.hp) + hpGain;
    const nextMp = Number(stats.mp) + mpGain;

    const result = await client.query<PlayerStatsRow>(
      `UPDATE player_stats
       SET status_points = status_points - $2,
           ${allocColumn} = ${allocColumn} + 1,
           max_hp = $3,
           max_mp = $4,
           atk = $5,
           def = $6,
           speed = $7,
           crit_chance = $8,
           crit_damage = $9,
           status_resist = $10,
           evasion = $11,
           accuracy = $12,
           hp = $13,
           mp = $14,
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING ${STATS_COLUMNS}`,
      [
        userId,
        STATUS_POINT_COST,
        formatted.maxHp,
        formatted.maxMp,
        formatted.atk,
        formatted.def,
        formatted.speed,
        formatted.critChance,
        formatted.critDamage,
        formatted.statusResist,
        formatted.evasion,
        formatted.accuracy,
        nextHp.toString(),
        nextMp.toString(),
      ]
    );

    return result.rows[0];
  });
}

export async function resetStatusAllocations(
  pool: DbPool,
  userId: string
): Promise<PlayerStatsRow> {
  return withTransaction(pool, async (client) => {
    const stats = await getPlayerStatsForUpdate(client, userId);
    if (!stats) {
      throw new StatusAllocationError("Player stats not found", "STATS_NOT_FOUND");
    }

    const allocations = readAllocations(stats);
    const refund = totalAllocatedStatusPoints(allocations);
    if (refund <= 0) {
      throw new StatusAllocationError(
        "No status allocations to reset",
        "NOTHING_TO_RESET"
      );
    }

    const merged = mergedPlayerStatsFromAllocations(
      stats.level,
      emptyStatusAllocations()
    );
    const formatted = formatMergedStats(merged);
    const baseSecondary = BASE_SECONDARY_PLAYER_STATS;
    const nextHp = Math.min(Number(stats.hp), merged.maxHp);
    const nextMp = Math.min(Number(stats.mp), merged.maxMp);

    const result = await client.query<PlayerStatsRow>(
      `UPDATE player_stats
       SET status_points = status_points + $2,
           alloc_hp = 0,
           alloc_mp = 0,
           alloc_atk = 0,
           alloc_def = 0,
           alloc_spd = 0,
           alloc_crit = 0,
           alloc_crit_dmg = 0,
           alloc_resist = 0,
           alloc_eva = 0,
           alloc_acc = 0,
           max_hp = $3,
           max_mp = $4,
           atk = $5,
           def = $6,
           speed = $7,
           crit_chance = $8,
           crit_damage = $9,
           status_resist = $10,
           evasion = $11,
           accuracy = $12,
           hp = $13,
           mp = $14,
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING ${STATS_COLUMNS}`,
      [
        userId,
        refund,
        formatted.maxHp,
        formatted.maxMp,
        formatted.atk,
        formatted.def,
        formatted.speed,
        baseSecondary.critChance.toString(),
        baseSecondary.critDamage.toString(),
        baseSecondary.statusResist.toString(),
        baseSecondary.evasion.toString(),
        baseSecondary.accuracy.toString(),
        nextHp.toString(),
        nextMp.toString(),
      ]
    );

    return result.rows[0];
  });
}
