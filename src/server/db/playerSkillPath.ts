import { normalizeSkillPath } from "../../engine/skills/catalog";
import type { SkillPath } from "../../engine/types";
import type { DbClient, DbPool } from "./client";

export async function getPlayerSkillPath(
  poolOrClient: DbPool | DbClient,
  userId: string
): Promise<SkillPath> {
  const result = await poolOrClient.query<{ active_skill_path: string }>(
    `SELECT active_skill_path FROM player_stats WHERE user_id = $1`,
    [userId]
  );

  if (!result.rowCount) {
    throw new Error(`Player stats not found for user ${userId}`);
  }

  return normalizeSkillPath(result.rows[0].active_skill_path);
}

export async function setPlayerSkillPath(
  pool: DbPool,
  userId: string,
  path: SkillPath
): Promise<SkillPath> {
  const result = await pool.query<{ active_skill_path: SkillPath }>(
    `UPDATE player_stats
     SET active_skill_path = $2, updated_at = NOW()
     WHERE user_id = $1
     RETURNING active_skill_path`,
    [userId, path]
  );

  if (!result.rowCount) {
    throw new Error(`Player stats not found for user ${userId}`);
  }

  return result.rows[0].active_skill_path;
}
