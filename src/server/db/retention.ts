import type { DbPool } from "./client";

const DEFAULT_IDEMPOTENCY_RETENTION_DAYS = 30;
const DEFAULT_LEDGER_RETENTION_DAYS = 365;

export interface RetentionPurgeResult {
  idempotencyKeys: number;
  walletLedger: number;
}

export async function purgeStaleIdempotencyKeys(
  pool: DbPool,
  retentionDays: number = DEFAULT_IDEMPOTENCY_RETENTION_DAYS
): Promise<number> {
  const result = await pool.query(
    `DELETE FROM idempotency_keys
     WHERE completed_at IS NOT NULL
       AND completed_at < NOW() - ($1::int * INTERVAL '1 day')`,
    [retentionDays]
  );
  return result.rowCount ?? 0;
}

/** Archives old ledger rows — keeps balance intact (ledger is audit trail). */
export async function purgeStaleWalletLedger(
  pool: DbPool,
  retentionDays: number = DEFAULT_LEDGER_RETENTION_DAYS
): Promise<number> {
  const result = await pool.query(
    `DELETE FROM wallet_ledger
     WHERE created_at < NOW() - ($1::int * INTERVAL '1 day')`,
    [retentionDays]
  );
  return result.rowCount ?? 0;
}

export async function runRetentionPurge(pool: DbPool): Promise<RetentionPurgeResult> {
  const idempotencyKeys = await purgeStaleIdempotencyKeys(pool);
  const walletLedger = await purgeStaleWalletLedger(pool);
  return { idempotencyKeys, walletLedger };
}

export interface TableSizeRow {
  table: string;
  rowEstimate: number;
  totalBytes: number;
}

export async function getTableSizeEstimates(pool: DbPool): Promise<TableSizeRow[]> {
  const result = await pool.query<{
    table_name: string;
    row_estimate: string;
    total_bytes: string;
  }>(
    `SELECT
       relname AS table_name,
       reltuples::bigint::text AS row_estimate,
       pg_total_relation_size(relid)::text AS total_bytes
     FROM pg_catalog.pg_statio_user_tables
     ORDER BY pg_total_relation_size(relid) DESC`
  );

  return result.rows.map((row) => ({
    table: row.table_name,
    rowEstimate: Number(row.row_estimate),
    totalBytes: Number(row.total_bytes),
  }));
}
