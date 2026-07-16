import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createDbPool, type DbPool } from "../client";
import { createUser, getUserByExternalId } from "../users";
import { upsertLocalizedString } from "../localization";
import { processWalletTransaction } from "../wallet";
import { addItemToInventory } from "../inventory";
import { SEED_LOCALIZATION, DEMO_USER } from "./data";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = join(__dirname, "..", "schema");

export async function runMigrations(pool: DbPool): Promise<void> {
  const files = readdirSync(SCHEMA_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(SCHEMA_DIR, file), "utf-8");
    console.log(`  → Running ${file}`);
    try {
      await pool.query(sql);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("already exists")) {
        console.log(`  → Skipped ${file} (already applied)`);
        continue;
      }
      throw err;
    }
  }
}

export async function seedLocalization(pool: DbPool): Promise<number> {
  let count = 0;

  for (const entry of SEED_LOCALIZATION) {
    await upsertLocalizedString(
      pool,
      entry.string_id,
      entry.locale,
      entry.text_value
    );
    count++;
  }

  return count;
}

export async function seedDemoUser(pool: DbPool): Promise<string | null> {
  const existing = await getUserByExternalId(pool, DEMO_USER.externalId);
  if (existing) {
    console.log(`  → Demo user already exists (${existing.id})`);
    await seedDemoInventory(pool, existing.id);
    return existing.id;
  }

  const user = await createUser(pool, {
    externalId: DEMO_USER.externalId,
    displayName: DEMO_USER.displayName,
    preferredLocale: DEMO_USER.preferredLocale,
  });

  await processWalletTransaction(pool, {
    idempotencyKey: `seed:demo_gold:${user.id}`,
    userId: user.id,
    amount: DEMO_USER.starterGold,
    type: "admin_adjustment",
    metadata: { reason: "demo_starter_gold" },
  });

  console.log(`  → Created demo user ${user.id} with ${DEMO_USER.starterGold} gold`);
  await seedDemoInventory(pool, user.id);
  return user.id;
}

/** Starter equippable items for testing bag → equip flow */
export async function seedDemoInventory(pool: DbPool, userId: string): Promise<void> {
  const existing = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM inventory_items WHERE user_id = $1`,
    [userId]
  );
  if (Number(existing.rows[0]?.count ?? 0) > 0) {
    console.log("  → Demo inventory already has items, skipping");
    return;
  }

  const items = [
    { itemId: "gear.imperial.weapon.katana", quantity: 1, rarity: "rare" as const },
    { itemId: "gear.imperial.chest.robe", quantity: 1, rarity: "epic" as const },
    { itemId: "drop_f13_rare", quantity: 1, rarity: "rare" as const },
  ];

  for (const item of items) {
    await addItemToInventory(pool, userId, {
      itemId: item.itemId,
      quantity: item.quantity,
      rarity: item.rarity,
    });
  }

  console.log(`  → Seeded ${items.length} demo inventory items`);
}
