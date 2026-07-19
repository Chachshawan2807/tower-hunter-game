import "dotenv/config";
import { closeDbPool, createDbPool } from "../src/server/db";
import {
  runMigrations,
  seedDemoUser,
  seedAllUsersMailbox,
  seedLocalization,
} from "../src/server/db/seed/run";

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const pool = createDbPool({ connectionString });

  console.log("=== Tower Hunter DB Seed ===\n");

  console.log("Running migrations...");
  await runMigrations(pool);

  console.log("\nSeeding localization...");
  const locCount = await seedLocalization(pool);
  console.log(`  → Upserted ${locCount} localization entries`);

  console.log("\nSeeding demo user...");
  await seedDemoUser(pool);

  console.log("\nBackfilling starter mailbox for all users...");
  await seedAllUsersMailbox(pool);

  console.log("\n✓ Seed complete");
  await closeDbPool();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
