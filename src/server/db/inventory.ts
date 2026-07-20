import { INVENTORY_MAX_CAPACITY } from "../../engine/types";
import { withTransaction, type DbClient, type DbPool } from "./client";
import { addToMailboxClient } from "./mailbox";
import type {
  AddItemResult,
  InventoryItemInput,
  InventoryItemRow,
} from "./types";

export type { InventoryItemRow };

export async function countInventoryQuantity(
  pool: DbPool,
  userId: string
): Promise<number> {
  const result = await pool.query<{ total: string }>(
    `SELECT COALESCE(SUM(quantity), 0)::TEXT AS total
     FROM inventory_items
     WHERE user_id = $1`,
    [userId]
  );

  return Number(result.rows[0]?.total ?? 0);
}

async function countInventoryQuantityClient(
  client: DbClient,
  userId: string
): Promise<number> {
  const result = await client.query<{ total: string }>(
    `SELECT COALESCE(SUM(quantity), 0)::TEXT AS total
     FROM inventory_items
     WHERE user_id = $1`,
    [userId]
  );

  return Number(result.rows[0]?.total ?? 0);
}

async function upsertInventoryItem(
  client: DbClient,
  userId: string,
  item: InventoryItemInput
): Promise<InventoryItemRow> {
  const result = await client.query<InventoryItemRow>(
    `INSERT INTO inventory_items (user_id, item_id, quantity, rarity)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, item_id)
     DO UPDATE SET
       quantity = inventory_items.quantity + EXCLUDED.quantity,
       rarity = EXCLUDED.rarity,
       updated_at = NOW()
     RETURNING id, user_id, item_id, quantity, rarity, created_at, updated_at`,
    [userId, item.itemId, item.quantity, item.rarity]
  );

  return result.rows[0];
}

/** Adds an item to inventory. When full, routes to temporary mailbox (14-day TTL). */
export async function addItemToInventory(
  pool: DbPool,
  userId: string,
  item: InventoryItemInput
): Promise<AddItemResult> {
  if (item.quantity <= 0) {
    throw new Error("Item quantity must be positive");
  }

  return withTransaction(pool, async (client) => {
    const currentTotal = await countInventoryQuantityClient(client, userId);
    const hasCapacity = currentTotal + item.quantity <= INVENTORY_MAX_CAPACITY;

    if (hasCapacity) {
      const row = await upsertInventoryItem(client, userId, item);
      return {
        outcome: "inventory",
        itemId: row.item_id,
        quantity: item.quantity,
      };
    }

    const mailboxRow = await addToMailboxClient(client, userId, {
      itemId: item.itemId,
      quantity: item.quantity,
      rarity: item.rarity,
      sourceFloor: item.sourceFloor,
    });

    return {
      outcome: "mailbox",
      itemId: item.itemId,
      quantity: item.quantity,
      mailboxId: mailboxRow.id,
    };
  });
}

export async function listInventoryItems(
  pool: DbPool,
  userId: string
): Promise<InventoryItemRow[]> {
  const result = await pool.query<InventoryItemRow>(
    `SELECT id, user_id, item_id, quantity, rarity, created_at, updated_at
     FROM inventory_items
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId]
  );

  return result.rows;
}

export async function getInventoryItemById(
  client: DbClient,
  userId: string,
  inventoryId: string
): Promise<InventoryItemRow | null> {
  const result = await client.query<InventoryItemRow>(
    `SELECT id, user_id, item_id, quantity, rarity, created_at, updated_at
     FROM inventory_items
     WHERE id = $1 AND user_id = $2
     FOR UPDATE`,
    [inventoryId, userId]
  );

  return result.rows[0] ?? null;
}
