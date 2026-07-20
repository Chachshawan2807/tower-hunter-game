import "dotenv/config";
import { closeDbPool, createDbPool } from "../src/server/db";
import { runMigrations } from "../src/server/db/seed/run";

async function verifySchema(pool: ReturnType<typeof createDbPool>): Promise<void> {
  const skillPoints = await pool.query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'player_stats'
       AND column_name = 'skill_points'`
  );

  if (!skillPoints.rowCount) {
    throw new Error("Missing column: player_stats.skill_points");
  }
  console.log("✓ Column player_stats.skill_points exists");

  const statusPoints = await pool.query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'player_stats'
       AND column_name = 'status_points'`
  );

  if (!statusPoints.rowCount) {
    throw new Error("Missing column: player_stats.status_points");
  }
  console.log("✓ Column player_stats.status_points exists");

  const loadoutTable = await pool.query<{ table_name: string }>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = 'player_skill_loadout'`
  );

  if (!loadoutTable.rowCount) {
    throw new Error("Missing table: player_skill_loadout");
  }
  console.log("✓ Table player_skill_loadout exists");

  const upgradesTable = await pool.query<{ table_name: string }>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = 'player_skill_upgrades'`
  );

  if (!upgradesTable.rowCount) {
    throw new Error("Missing table: player_skill_upgrades");
  }
  console.log("✓ Table player_skill_upgrades exists");

  const unlocksTable = await pool.query<{ table_name: string }>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = 'player_skill_unlocks'`
  );

  if (!unlocksTable.rowCount) {
    throw new Error("Missing table: player_skill_unlocks");
  }
  console.log("✓ Table player_skill_unlocks exists");
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL is not set in .env");
    process.exit(1);
  }

  const pool = createDbPool({ connectionString });

  try {
    const result = await pool.query<{ now: Date }>("SELECT NOW() AS now");
    console.log("✓ Database connected:", result.rows[0].now);

    console.log("\nRunning migrations...");
    await runMigrations(pool);

    console.log("\nVerifying skill system schema...");
    await verifySchema(pool);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("✗ Database check failed:", message);
    process.exit(1);
  } finally {
    await closeDbPool();
  }
}

main();
