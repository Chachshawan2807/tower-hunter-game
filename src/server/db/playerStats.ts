import type { StatusAllocations } from "../../engine/formulas/statusPoints";
import type { CombatStats, SkillPath } from "../../engine/types";
import type { DbClient, DbPool } from "./client";

export interface PlayerStatsRow {
  user_id: string;
  level: number;
  exp: string;
  hp: string;
  max_hp: string;
  mp: string;
  max_mp: string;
  atk: string;
  def: string;
  speed: string;
  crit_chance: string;
  crit_damage: string;
  crit_resist: string;
  accuracy: string;
  evasion: string;
  status_chance: string;
  status_resist: string;
  current_floor: number;
  active_skill_path: SkillPath;
  skill_points: number;
  status_points: number;
  alloc_hp: number;
  alloc_mp: number;
  alloc_atk: number;
  alloc_def: number;
  alloc_spd: number;
  alloc_crit: number;
  alloc_crit_dmg: number;
  alloc_resist: number;
  alloc_eva: number;
  alloc_acc: number;
  updated_at: Date;
}

const STATS_COLUMNS = `user_id, level, exp, hp, max_hp, mp, max_mp, atk, def, speed,
  crit_chance, crit_damage, crit_resist, accuracy, evasion, status_chance, status_resist,
  current_floor, active_skill_path, skill_points, status_points,
  alloc_hp, alloc_mp, alloc_atk, alloc_def, alloc_spd,
  alloc_crit, alloc_crit_dmg, alloc_resist, alloc_eva, alloc_acc, updated_at`;

export { STATS_COLUMNS };

export function statusAllocationsFromRow(row: PlayerStatsRow): StatusAllocations {
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

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

export function toCombatStats(row: PlayerStatsRow): CombatStats {
  return {
    level: row.level,
    exp: toNumber(row.exp),
    hp: toNumber(row.hp),
    maxHp: toNumber(row.max_hp),
    mp: toNumber(row.mp),
    maxMp: toNumber(row.max_mp),
    atk: toNumber(row.atk),
    def: toNumber(row.def),
    speed: toNumber(row.speed),
    critChance: toNumber(row.crit_chance),
    critDamage: toNumber(row.crit_damage),
    critResist: toNumber(row.crit_resist),
    accuracy: toNumber(row.accuracy),
    evasion: toNumber(row.evasion),
    statusChance: toNumber(row.status_chance),
    statusResist: toNumber(row.status_resist),
  };
}

export async function createDefaultPlayerStats(
  client: DbClient,
  userId: string
): Promise<PlayerStatsRow> {
  const result = await client.query<PlayerStatsRow>(
    `INSERT INTO player_stats (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING ${STATS_COLUMNS}`,
    [userId]
  );

  if (result.rows[0]) {
    return result.rows[0];
  }

  const existing = await client.query<PlayerStatsRow>(
    `SELECT ${STATS_COLUMNS} FROM player_stats WHERE user_id = $1`,
    [userId]
  );

  return existing.rows[0];
}

export async function getPlayerStats(
  pool: DbPool,
  userId: string
): Promise<PlayerStatsRow | null> {
  const result = await pool.query<PlayerStatsRow>(
    `SELECT ${STATS_COLUMNS} FROM player_stats WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function getPlayerStatsForUpdate(
  client: DbClient,
  userId: string
): Promise<PlayerStatsRow | null> {
  const result = await client.query<PlayerStatsRow>(
    `SELECT ${STATS_COLUMNS}
     FROM player_stats
     WHERE user_id = $1
     FOR UPDATE`,
    [userId]
  );

  return result.rows[0] ?? null;
}

export {
  applyBattleWinProgress,
  resetPlayerHpAfterDefeat,
} from "./playerStatsProgress";
export { getPlayerSkillPath, setPlayerSkillPath } from "./playerSkillPath";
