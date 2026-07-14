import { INVENTORY_MAX_CAPACITY } from "../../engine/types";
import { withTransaction, type DbClient, type DbPool } from "./client";
import { addToMailboxClient } from "./mailbox";
import { processWalletTransactionClient } from "./wallet";
import type {
  AddItemResult,
  InventoryItemInput,
  InventoryItemRow,
} from "./types";

export type { InventoryItemRow };

/** Gold credited when auto-dismantling one common item (lowest denomination). */
export const COMMON_DISMANTLE_GOLD = 1n;

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

/**
 * Adds an item to inventory. When full (100 items):
 * - auto_dismantle + common → credit gold via ledger
 * - otherwise → route to temporary mailbox (14-day TTL)
 */
export async function addItemToInventory(
  pool: DbPool,
  userId: string,
  item: InventoryItemInput,
  options?: { idempotencyKey?: string }
): Promise<AddItemResult> {
  if (item.quantity <= 0) {
    throw new Error("Item quantity must be positive");
  }

  return withTransaction(pool, async (client) => {
    const userLock = await client.query<{
      auto_dismantle_common: boolean;
    }>(
      `SELECT auto_dismantle_common
       FROM users
       WHERE id = $1
       FOR UPDATE`,
      [userId]
    );

    if (!userLock.rowCount) {
      throw new Error(`User ${userId} not found`);
    }

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

    const autoDismantle = userLock.rows[0].auto_dismantle_common;
    const canDismantle = autoDismantle && item.rarity === "common";

    if (canDismantle) {
      const goldAmount = COMMON_DISMANTLE_GOLD * BigInt(item.quantity);
      const idempotencyKey =
        options?.idempotencyKey ??
        `dismantle:${userId}:${item.itemId}:${item.quantity}`;

      const walletResult = await processWalletTransactionClient(client, {
        idempotencyKey,
        userId,
        amount: goldAmount,
        type: "dismantle",
        metadata: {
          itemId: item.itemId,
          quantity: item.quantity,
          reason: "inventory_overflow_auto_dismantle",
        },
      });

      return {
        outcome: "dismantled",
        itemId: item.itemId,
        quantity: item.quantity,
        goldCredited: goldAmount,
        walletResult,
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
