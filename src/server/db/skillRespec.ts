import { withTransaction, type DbPool } from "./client";
import { calculateRespecRefund } from "../../engine/skills/skillRespec";
import { getPlayerUpgrades } from "./skillUpgrades";
import { getPlayerSkillUnlocks } from "./skillUnlocks";

export async function respecPlayerSkills(
  pool: DbPool,
  userId: string
): Promise<{ skillPoints: number }> {
  const [unlockedSkillIds, upgrades] = await Promise.all([
    getPlayerSkillUnlocks(pool, userId),
    getPlayerUpgrades(pool, userId),
  ]);
  const refund = calculateRespecRefund(unlockedSkillIds, upgrades);

  return withTransaction(pool, async (client) => {
    await client.query(`DELETE FROM player_skill_unlocks WHERE user_id = $1`, [
      userId,
    ]);
    await client.query(`DELETE FROM player_skill_upgrades WHERE user_id = $1`, [
      userId,
    ]);
    await client.query(`DELETE FROM player_skill_loadout_v2 WHERE user_id = $1`, [
      userId,
    ]);

    const spResult = await client.query<{ skill_points: number }>(
      `UPDATE player_stats
       SET skill_points = skill_points + $2, updated_at = NOW()
       WHERE user_id = $1
       RETURNING skill_points`,
      [userId, refund]
    );

    return { skillPoints: spResult.rows[0]?.skill_points ?? refund };
  });
}
