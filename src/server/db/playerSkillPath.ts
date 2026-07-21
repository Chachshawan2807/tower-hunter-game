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
