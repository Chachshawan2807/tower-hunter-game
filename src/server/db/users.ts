import { parseBigInt, withTransaction, type DbPool } from "./client";
import { createDefaultPlayerStats } from "./playerStats";
import { seedNewPlayerKit } from "./newPlayerKit";
import type { SupportedLocale, UserRow } from "./types";
interface CreateUserInput {
  externalId: string;
  displayName: string;
  preferredLocale?: SupportedLocale;
}

interface UserRowDb {
  id: string;
  external_id: string;
  display_name: string;
  gold_balance: string;
  preferred_locale: SupportedLocale;
  created_at: Date;
  updated_at: Date;
}

function mapUserRow(row: UserRowDb): UserRow {
  return {
    id: row.id,
    external_id: row.external_id,
    display_name: row.display_name,
    gold_balance: parseBigInt(row.gold_balance),
    preferred_locale: row.preferred_locale,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function createUser(
  pool: DbPool,
  input: CreateUserInput
): Promise<UserRow> {
  return withTransaction(pool, async (client) => {
    const result = await client.query<UserRowDb>(
      `INSERT INTO users (external_id, display_name, preferred_locale)
       VALUES ($1, $2, $3)
       RETURNING id, external_id, display_name, gold_balance,
                 preferred_locale, created_at, updated_at`,
      [
        input.externalId,
        input.displayName,
        input.preferredLocale ?? "en",
      ]
    );

    await createDefaultPlayerStats(client, result.rows[0].id);
    await seedNewPlayerKit(client, result.rows[0].id, "imperial");
    return mapUserRow(result.rows[0]);
  });
}

export async function getUserById(
  pool: DbPool,
  userId: string
): Promise<UserRow | null> {
  const result = await pool.query<UserRowDb>(
    `SELECT id, external_id, display_name, gold_balance,
            preferred_locale, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
}

export async function getUserByExternalId(
  pool: DbPool,
  externalId: string
): Promise<UserRow | null> {
  const result = await pool.query<UserRowDb>(
    `SELECT id, external_id, display_name, gold_balance,
            preferred_locale, created_at, updated_at
     FROM users
     WHERE external_id = $1`,
    [externalId]
  );

  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
}

export async function updateDisplayName(
  pool: DbPool,
  userId: string,
  displayName: string
): Promise<UserRow> {
  const result = await pool.query<UserRowDb>(
    `UPDATE users
     SET display_name = $2
     WHERE id = $1
     RETURNING id, external_id, display_name, gold_balance,
               preferred_locale, created_at, updated_at`,
    [userId, displayName]
  );

  if (!result.rowCount) {
    throw new Error(`User ${userId} not found`);
  }

  return mapUserRow(result.rows[0]);
}
