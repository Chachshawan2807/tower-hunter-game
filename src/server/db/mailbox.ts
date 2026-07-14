import { MAILBOX_TTL_DAYS } from "../../engine/types";
import { withTransaction, type DbClient, type DbPool } from "./client";
import type { ItemRarity, MailboxItemRow } from "./types";

export interface MailboxItemInput {
  itemId: string;
  quantity: number;
  rarity: ItemRarity;
  sourceFloor?: number;
}

export function computeMailboxExpiry(from: Date = new Date()): Date {
  const expiresAt = new Date(from);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + MAILBOX_TTL_DAYS);
  return expiresAt;
}

export async function addToMailboxClient(
  client: DbClient,
  userId: string,
  item: MailboxItemInput
): Promise<MailboxItemRow> {
  const expiresAt = computeMailboxExpiry();

  const result = await client.query<MailboxItemRow>(
    `INSERT INTO mailbox_items (
       user_id, item_id, quantity, rarity, source_floor, expires_at
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, item_id, quantity, rarity, source_floor, expires_at, created_at`,
    [
      userId,
      item.itemId,
      item.quantity,
      item.rarity,
      item.sourceFloor ?? null,
      expiresAt.toISOString(),
    ]
  );

  return result.rows[0];
}

export async function addToMailbox(
  pool: DbPool,
  userId: string,
  item: MailboxItemInput
): Promise<MailboxItemRow> {
  return withTransaction(pool, (client) =>
    addToMailboxClient(client, userId, item)
  );
}

export async function listMailboxItems(
  pool: DbPool,
  userId: string
): Promise<MailboxItemRow[]> {
  const result = await pool.query<MailboxItemRow>(
    `SELECT id, user_id, item_id, quantity, rarity, source_floor, expires_at, created_at
     FROM mailbox_items
     WHERE user_id = $1
       AND expires_at > NOW()
     ORDER BY created_at ASC`,
    [userId]
  );

  return result.rows;
}

/**
 * Permanently removes mailbox entries past their 14-day TTL.
 * Intended for cron/scheduled server job execution.
 */
export async function purgeExpiredMailboxItems(pool: DbPool): Promise<number> {
  const result = await pool.query(
    `DELETE FROM mailbox_items
     WHERE expires_at <= NOW()`
  );

  return result.rowCount ?? 0;
}

export async function claimMailboxItem(
  pool: DbPool,
  userId: string,
  mailboxItemId: string
): Promise<MailboxItemRow | null> {
  return withTransaction(pool, async (client) => {
    const locked = await client.query<MailboxItemRow>(
      `SELECT id, user_id, item_id, quantity, rarity, source_floor, expires_at, created_at
       FROM mailbox_items
       WHERE id = $1
         AND user_id = $2
         AND expires_at > NOW()
       FOR UPDATE`,
      [mailboxItemId, userId]
    );

    if (!locked.rowCount) {
      return null;
    }

    await client.query(`DELETE FROM mailbox_items WHERE id = $1`, [
      mailboxItemId,
    ]);

    return locked.rows[0];
  });
}
