import type { CombatStats } from "../../engine/types";
import { parseBigInt, withTransaction, type DbClient, type DbPool } from "./client";

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
  updated_at: Date;
}

const STATS_COLUMNS = `user_id, level, exp, hp, max_hp, mp, max_mp, atk, def, speed,
  crit_chance, crit_damage, crit_resist, accuracy, evasion, status_chance, status_resist,
  current_floor, updated_at`;

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

export async function applyBattleWinProgress(
  pool: DbPool,
  userId: string,
  floor: number,
  expGained: number
): Promise<PlayerStatsRow> {
  return withTransaction(pool, async (client) => {
    const stats = await getPlayerStatsForUpdate(client, userId);
    if (!stats) {
      throw new Error(`Player stats not found for user ${userId}`);
    }

    const newExp = parseBigInt(stats.exp) + BigInt(expGained);
    const nextFloor = Math.min(floor + 1, 100);

    const result = await client.query<PlayerStatsRow>(
      `UPDATE player_stats
       SET exp = $2,
           current_floor = GREATEST(current_floor, $3),
           hp = max_hp,
           mp = max_mp,
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING ${STATS_COLUMNS}`,
      [userId, newExp.toString(), nextFloor]
    );

    return result.rows[0];
  });
}

export async function resetPlayerHpAfterDefeat(
  pool: DbPool,
  userId: string
): Promise<void> {
  await pool.query(
    `UPDATE player_stats
     SET hp = max_hp, mp = max_mp, updated_at = NOW()
     WHERE user_id = $1`,
    [userId]
  );
}
