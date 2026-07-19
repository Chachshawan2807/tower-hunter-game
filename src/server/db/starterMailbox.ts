import { addToMailbox, addToMailboxClient } from "./mailbox";
import type { DbClient, DbPool } from "./client";
import type { ItemRarity } from "./types";

export interface StarterMailboxItem {
  itemId: string;
  quantity: number;
  rarity: ItemRarity;
  sourceFloor: number;
}

/** Sample mailbox rewards shown in the bag mailbox tab during development. */
export const STARTER_MAILBOX_ITEMS: StarterMailboxItem[] = [
  { itemId: "shop_hp_potion", quantity: 5, rarity: "common", sourceFloor: 12 },
  { itemId: "drop_f25_rare", quantity: 1, rarity: "rare", sourceFloor: 25 },
  {
    itemId: "gear.imperial.cloak.sash",
    quantity: 1,
    rarity: "epic",
    sourceFloor: 42,
  },
];

export async function seedStarterMailboxClient(
  client: DbClient,
  userId: string
): Promise<void> {
  const existing = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM mailbox_items WHERE user_id = $1`,
    [userId]
  );
  if (Number(existing.rows[0]?.count ?? 0) > 0) {
    return;
  }

  for (const item of STARTER_MAILBOX_ITEMS) {
    await addToMailboxClient(client, userId, {
      itemId: item.itemId,
      quantity: item.quantity,
      rarity: item.rarity,
      sourceFloor: item.sourceFloor,
    });
  }
}

export async function seedStarterMailbox(
  pool: DbPool,
  userId: string
): Promise<boolean> {
  const existing = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM mailbox_items WHERE user_id = $1`,
    [userId]
  );
  if (Number(existing.rows[0]?.count ?? 0) > 0) {
    return false;
  }

  for (const item of STARTER_MAILBOX_ITEMS) {
    await addToMailbox(pool, userId, {
      itemId: item.itemId,
      quantity: item.quantity,
      rarity: item.rarity,
      sourceFloor: item.sourceFloor,
    });
  }

  return true;
}

/** Backfill starter mailbox items for every user with an empty mailbox. */
export async function seedStarterMailboxForAllUsers(pool: DbPool): Promise<number> {
  const users = await pool.query<{ id: string }>(`SELECT id FROM users`);
  let seeded = 0;

  for (const user of users.rows) {
    const added = await seedStarterMailbox(pool, user.id);
    if (added) seeded++;
  }

  return seeded;
}
