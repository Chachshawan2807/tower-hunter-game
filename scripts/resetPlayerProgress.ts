import "dotenv/config";
import { closeDbPool, createDbPool, withTransaction } from "../src/server/db";
import { combatStatsForLevel } from "../src/engine/formulas/playerProgression";
import { DEMO_USER } from "../src/server/db/seed/data";

async function listUsers(): Promise<void> {
  const pool = createDbPool({ connectionString: process.env.DATABASE_URL! });
  const users = await pool.query<{
    id: string;
    external_id: string;
    display_name: string;
    gold_balance: string;
    level: number | null;
    exp: string | null;
    current_floor: number | null;
    skill_points: number | null;
  }>(
    `SELECT u.id, u.external_id, u.display_name, u.gold_balance,
            ps.level, ps.exp, ps.current_floor, ps.skill_points
     FROM users u
     LEFT JOIN player_stats ps ON ps.user_id = u.id
     ORDER BY u.created_at DESC`
  );
  console.table(users.rows);
  await closeDbPool();
}

async function resetUser(userId: string): Promise<void> {
  const pool = createDbPool({ connectionString: process.env.DATABASE_URL! });
  const level1 = combatStatsForLevel(1);

  await withTransaction(pool, async (client) => {
    await client.query(`DELETE FROM player_skill_upgrades WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM player_skill_unlocks WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM player_skill_loadout WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM player_equipment WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM inventory_items WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM mailbox_items WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM wallet_ledger WHERE user_id = $1`, [userId]);
    await client.query(`DELETE FROM idempotency_keys WHERE user_id = $1`, [userId]);

    await client.query(
      `UPDATE users
       SET gold_balance = $2, updated_at = NOW()
       WHERE id = $1`,
      [userId, DEMO_USER.starterGold.toString()]
    );

    await client.query(
      `UPDATE player_stats
       SET level = 1,
           exp = 0,
           hp = $2,
           max_hp = $2,
           mp = $3,
           max_mp = $3,
           atk = $4,
           def = $5,
           speed = $6,
           crit_chance = 0.1,
           crit_damage = 1.5,
           crit_resist = 0,
           accuracy = 100,
           evasion = 10,
           status_chance = 0.05,
           status_resist = 0.05,
           current_floor = 1,
           active_skill_path = 'imperial',
           skill_points = 0,
           updated_at = NOW()
       WHERE user_id = $1`,
      [
        userId,
        level1.maxHp.toString(),
        level1.maxMp.toString(),
        level1.atk.toString(),
        level1.def.toString(),
        level1.speed.toString(),
      ]
    );
  });

  console.log(`✓ Reset user ${userId} to level 1 (floor 1, ${DEMO_USER.starterGold} gold)`);
  await closeDbPool();
}

async function resetAllUsers(): Promise<void> {
  const pool = createDbPool({ connectionString: process.env.DATABASE_URL! });
  const users = await pool.query<{ id: string }>(`SELECT id FROM users ORDER BY created_at`);
  await closeDbPool();

  for (const user of users.rows) {
    await resetUser(user.id);
  }
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const arg = process.argv[2];

  if (!arg || arg === "list") {
    console.log("Current users:\n");
    await listUsers();
    return;
  }

  if (arg === "all") {
    await resetAllUsers();
    console.log("\nAfter reset:\n");
    await listUsers();
    return;
  }

  await resetUser(arg);
  console.log("\nAfter reset:\n");
  await listUsers();
}

main().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
