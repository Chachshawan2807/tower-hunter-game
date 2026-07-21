import {
  calculateStatusPointGrant,
  mergedPlayerStatsFromAllocations,
} from "../../engine/formulas/statusPoints";
import { calculateSpGrant } from "../../engine/skills/skillPoints";
import { isBossFloor } from "../../engine/types";
import { levelFromTotalExp } from "../../engine/formulas/playerProgression";
import { parseBigInt, withTransaction, type DbPool } from "./client";
import {
  getPlayerStatsForUpdate,
  STATS_COLUMNS,
  statusAllocationsFromRow,
  type PlayerStatsRow,
} from "./playerStats";

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

    const oldLevel = stats.level;
    const newExp = parseBigInt(stats.exp) + BigInt(expGained);
    const nextFloor = Math.min(floor + 1, 100);
    const newLevel = levelFromTotalExp(Number(newExp));
    const levelStats = mergedPlayerStatsFromAllocations(
      newLevel,
      statusAllocationsFromRow(stats)
    );
    const spGrant = calculateSpGrant(oldLevel, newLevel, isBossFloor(floor));
    const statusGrant = calculateStatusPointGrant(oldLevel, newLevel);

    const result = await client.query<PlayerStatsRow>(
      `UPDATE player_stats
       SET exp = $2,
           level = $3,
           max_hp = $4,
           max_mp = $5,
           atk = $6,
           def = $7,
           speed = $8,
           current_floor = GREATEST(current_floor, $9),
           hp = $4,
           mp = $5,
           skill_points = skill_points + $10,
           status_points = status_points + $11,
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING ${STATS_COLUMNS}`,
      [
        userId,
        newExp.toString(),
        levelStats.level,
        levelStats.maxHp.toString(),
        levelStats.maxMp.toString(),
        levelStats.atk.toString(),
        levelStats.def.toString(),
        levelStats.speed.toString(),
        nextFloor,
        spGrant,
        statusGrant,
      ]
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
