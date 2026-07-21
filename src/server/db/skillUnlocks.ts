import { getAllSkills, getSkillById } from "../../engine/skills";
import {
  getSkillUnlockSpCost,
  isSkillUnlockedByLevel,
} from "../../engine/skills/skillUnlock";
import { withTransaction, type DbClient, type DbPool } from "./client";
import { getPlayerStats } from "./playerStats";

const UNLOCK_ERROR_CODES = new Set([
  "INVALID_SKILL",
  "ALREADY_UNLOCKED",
  "INSUFFICIENT_SP",
]);

export class SkillUnlockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SkillUnlockError";
  }
}

async function listUnlockRows(
  client: DbClient,
  userId: string
): Promise<string[]> {
  const result = await client.query<{ skill_id: string }>(
    `SELECT skill_id FROM player_skill_unlocks WHERE user_id = $1`,
    [userId]
  );
  return result.rows.map((row) => row.skill_id);
}

async function backfillLevelUnlocks(
  pool: DbPool,
  userId: string
): Promise<string[]> {
  const stats = await getPlayerStats(pool, userId);
  const playerLevel = stats?.level ?? 1;
  const skillIds = getAllSkills()
    .filter(
      (skill) =>
        skill.path === "player" &&
        isSkillUnlockedByLevel(skill, playerLevel)
    )
    .map((skill) => skill.id);

  if (skillIds.length === 0) {
    return [];
  }

  return withTransaction(pool, async (client) => {
    for (const skillId of skillIds) {
      await client.query(
        `INSERT INTO player_skill_unlocks (user_id, skill_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, skill_id) DO NOTHING`,
        [userId, skillId]
      );
    }
    return listUnlockRows(client, userId);
  });
}

export async function getPlayerSkillUnlocks(
  pool: DbPool,
  userId: string
): Promise<string[]> {
  const result = await pool.query<{ skill_id: string }>(
    `SELECT skill_id FROM player_skill_unlocks WHERE user_id = $1`,
    [userId]
  );
  const existing = result.rows.map((row) => row.skill_id);
  if (existing.length > 0) {
    return existing;
  }

  return backfillLevelUnlocks(pool, userId);
}

export async function unlockPlayerSkill(
  pool: DbPool,
  userId: string,
  skillId: string
): Promise<{ skillPoints: number; unlockedSkillIds: string[] }> {
  const skill = getSkillById(skillId);
  if (skill.path !== "player") {
    throw new SkillUnlockError("INVALID_SKILL");
  }

  const cost = getSkillUnlockSpCost(skill);

  return withTransaction(pool, async (client) => {
    const existing = await client.query<{ skill_id: string }>(
      `SELECT skill_id FROM player_skill_unlocks
       WHERE user_id = $1 AND skill_id = $2`,
      [userId, skillId]
    );
    if (existing.rows.length > 0) {
      throw new SkillUnlockError("ALREADY_UNLOCKED");
    }

    const statsResult = await client.query<{ skill_points: number }>(
      `SELECT skill_points FROM player_stats
       WHERE user_id = $1
       FOR UPDATE`,
      [userId]
    );
    const currentSp = statsResult.rows[0]?.skill_points ?? 0;
    if (currentSp < cost) {
      throw new SkillUnlockError("INSUFFICIENT_SP");
    }

    const spResult = await client.query<{ skill_points: number }>(
      `UPDATE player_stats
       SET skill_points = skill_points - $2, updated_at = NOW()
       WHERE user_id = $1
       RETURNING skill_points`,
      [userId, cost]
    );

    await client.query(
      `INSERT INTO player_skill_unlocks (user_id, skill_id)
       VALUES ($1, $2)`,
      [userId, skillId]
    );

    const unlockedSkillIds = await listUnlockRows(client, userId);
    return {
      skillPoints: spResult.rows[0].skill_points,
      unlockedSkillIds,
    };
  });
}

export async function clearPlayerSkillUnlocks(
  pool: DbPool,
  userId: string
): Promise<void> {
  await pool.query(`DELETE FROM player_skill_unlocks WHERE user_id = $1`, [
    userId,
  ]);
}

export function isSkillUnlockError(err: unknown): err is SkillUnlockError {
  return (
    err instanceof SkillUnlockError &&
    UNLOCK_ERROR_CODES.has(err.message)
  );
}
