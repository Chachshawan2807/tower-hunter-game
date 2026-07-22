import { parseBigInt, type DbClient } from "./client";
import {
  IdempotencyConflictError,
  type IdempotencyKeyRow,
  type IdempotencyStatus,
  type WalletTransactionResult,
} from "./types";

export interface IdempotencyReservation {
  replay: boolean;
  cachedResult?: WalletTransactionResult;
  cachedPayload?: Record<string, unknown>;
}

interface ReserveIdempotencyParams {
  key: string;
  userId: string;
  operation: string;
}

export async function reserveIdempotencyKey(
  client: DbClient,
  params: ReserveIdempotencyParams
): Promise<IdempotencyReservation> {
  const insert = await client.query<IdempotencyKeyRow>(
    `INSERT INTO idempotency_keys (key, user_id, operation, status)
     VALUES ($1, $2, $3, 'processing')
     ON CONFLICT (key) DO NOTHING
     RETURNING key, user_id, operation, status, response_payload, created_at, completed_at`,
    [params.key, params.userId, params.operation]
  );

  if (insert.rowCount && insert.rowCount > 0) {
    return { replay: false };
  }

  const existing = await client.query<IdempotencyKeyRow>(
    `SELECT key, user_id, operation, status, response_payload, created_at, completed_at
     FROM idempotency_keys
     WHERE key = $1
     FOR UPDATE`,
    [params.key]
  );

  const row = existing.rows[0];
  if (!row) {
    return { replay: false };
  }

  if (row.status === "completed" && row.response_payload) {
    const payload = row.response_payload;
    if (payload.kind === "wallet") {
      return {
        replay: true,
        cachedResult: parseCachedWalletResult(payload),
      };
    }
    return { replay: true, cachedPayload: payload };
  }

  if (row.status === "processing") {
    throw new IdempotencyConflictError(params.key);
  }

  throw new IdempotencyConflictError(params.key);
}

export async function completeIdempotencyKey(
  client: DbClient,
  key: string,
  payload: WalletTransactionResult,
  status: IdempotencyStatus = "completed"
): Promise<void> {
  await completeIdempotencyPayload(client, key, {
    kind: "wallet",
    ...payload,
    amount: payload.amount.toString(),
    balanceAfter: payload.balanceAfter.toString(),
  }, status);
}

export async function completeIdempotencyPayload(
  client: DbClient,
  key: string,
  payload: Record<string, unknown>,
  status: IdempotencyStatus = "completed"
): Promise<void> {
  await client.query(
    `UPDATE idempotency_keys
     SET status = $2,
         response_payload = $3::JSONB,
         completed_at = NOW()
     WHERE key = $1`,
    [key, status, JSON.stringify(payload, bigintReplacer)]
  );
}

export async function failIdempotencyKey(
  client: DbClient,
  key: string,
  reason: string
): Promise<void> {
  await client.query(
    `UPDATE idempotency_keys
     SET status = 'failed',
         response_payload = $2::JSONB,
         completed_at = NOW()
     WHERE key = $1`,
    [key, JSON.stringify({ error: reason })]
  );
}

function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

function parseCachedWalletResult(
  payload: Record<string, unknown>
): WalletTransactionResult {
  return {
    ledgerId: String(payload.ledgerId),
    userId: String(payload.userId),
    amount: parseBigInt(payload.amount as string | number | bigint),
    balanceAfter: parseBigInt(
      payload.balanceAfter as string | number | bigint
    ),
    idempotencyKey: String(payload.idempotencyKey),
    replayed: true,
  };
}

export function parseCachedOperationPayload<T extends Record<string, unknown>>(
  payload: Record<string, unknown>
): T {
  return payload as T;
}

export function buildWalletOperationKey(
  type: string,
  idempotencyKey: string
): string {
  return `wallet:${type}:${idempotencyKey}`;
}
