import { parseBigInt, type DbPool } from "./client";
import type { SupportedLocale, UserRow } from "./types";

interface CreateUserInput {
  externalId: string;
  displayName: string;
  preferredLocale?: SupportedLocale;
  autoDismantleCommon?: boolean;
}

interface UserRowDb {
  id: string;
  external_id: string;
  display_name: string;
  gold_balance: string;
  auto_dismantle_common: boolean;
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
    auto_dismantle_common: row.auto_dismantle_common,
    preferred_locale: row.preferred_locale,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function createUser(
  pool: DbPool,
  input: CreateUserInput
): Promise<UserRow> {
  const result = await pool.query<UserRowDb>(
    `INSERT INTO users (external_id, display_name, preferred_locale, auto_dismantle_common)
     VALUES ($1, $2, $3, $4)
     RETURNING id, external_id, display_name, gold_balance, auto_dismantle_common,
               preferred_locale, created_at, updated_at`,
    [
      input.externalId,
      input.displayName,
      input.preferredLocale ?? "en",
      input.autoDismantleCommon ?? false,
    ]
  );

  return mapUserRow(result.rows[0]);
}

export async function getUserById(
  pool: DbPool,
  userId: string
): Promise<UserRow | null> {
  const result = await pool.query<UserRowDb>(
    `SELECT id, external_id, display_name, gold_balance, auto_dismantle_common,
            preferred_locale, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
}

export async function setAutoDismantleCommon(
  pool: DbPool,
  userId: string,
  enabled: boolean
): Promise<UserRow> {
  const result = await pool.query<UserRowDb>(
    `UPDATE users
     SET auto_dismantle_common = $2
     WHERE id = $1
     RETURNING id, external_id, display_name, gold_balance, auto_dismantle_common,
               preferred_locale, created_at, updated_at`,
    [userId, enabled]
  );

  if (!result.rowCount) {
    throw new Error(`User ${userId} not found`);
  }

  return mapUserRow(result.rows[0]);
}
