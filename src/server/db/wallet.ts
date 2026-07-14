import { parseBigInt, withTransaction, type DbClient, type DbPool } from "./client";
import {
  buildWalletOperationKey,
  completeIdempotencyKey,
  failIdempotencyKey,
  reserveIdempotencyKey,
} from "./idempotency";
import {
  InsufficientGoldError,
  type WalletLedgerRow,
  type WalletTransactionRequest,
  type WalletTransactionResult,
} from "./types";

function toSignedAmount(
  amount: bigint,
  type: WalletTransactionRequest["type"]
): bigint {
  const absolute = amount < 0n ? -amount : amount;

  if (type === "purchase") {
    return -absolute;
  }

  return absolute;
}

function mapLedgerRow(row: WalletLedgerRow): WalletTransactionResult {
  return {
    ledgerId: row.id,
    userId: row.user_id,
    amount: parseBigInt(row.amount),
    balanceAfter: 0n,
    idempotencyKey: row.idempotency_key,
    replayed: false,
  };
}

/**
 * Processes a wallet credit/debit within an existing transaction.
 * Uses idempotency key verification and row-level locking on users.
 */
export async function processWalletTransactionClient(
  client: DbClient,
  request: WalletTransactionRequest
): Promise<WalletTransactionResult> {
  if (request.amount === 0n) {
    throw new Error("Wallet transaction amount must be non-zero");
  }

  const signedAmount = toSignedAmount(request.amount, request.type);
  const operation = buildWalletOperationKey(request.type, request.idempotencyKey);

  const reservation = await reserveIdempotencyKey(client, {
    key: request.idempotencyKey,
    userId: request.userId,
    operation,
  });

  if (reservation.replay && reservation.cachedResult) {
    return { ...reservation.cachedResult, replayed: true };
  }

  await client.query(`SELECT id FROM users WHERE id = $1 FOR UPDATE`, [
    request.userId,
  ]);

  const ledgerInsert = await client.query<WalletLedgerRow>(
    `INSERT INTO wallet_ledger (
       user_id, amount, transaction_type, idempotency_key, metadata
     )
     VALUES ($1, $2, $3, $4, $5::JSONB)
     RETURNING id, user_id, amount, transaction_type, idempotency_key, metadata, created_at`,
    [
      request.userId,
      signedAmount.toString(),
      request.type,
      request.idempotencyKey,
      JSON.stringify(request.metadata ?? {}),
    ]
  );

  const balanceRow = await client.query<{ gold_balance: string }>(
    `SELECT gold_balance FROM users WHERE id = $1`,
    [request.userId]
  );

  const result: WalletTransactionResult = {
    ...mapLedgerRow(ledgerInsert.rows[0]),
    balanceAfter: parseBigInt(balanceRow.rows[0].gold_balance),
    replayed: false,
  };

  await completeIdempotencyKey(client, request.idempotencyKey, result);
  return result;
}

/**
 * Processes a wallet credit/debit through the append-only ledger.
 * Opens its own transaction when not participating in a parent one.
 */
export async function processWalletTransaction(
  pool: DbPool,
  request: WalletTransactionRequest
): Promise<WalletTransactionResult> {
  try {
    return await withTransaction(pool, (client) =>
      processWalletTransactionClient(client, request)
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Insufficient gold balance")
    ) {
      throw new InsufficientGoldError(request.userId);
    }

    await failIdempotencyKeySafe(pool, request.idempotencyKey, error);
    throw error;
  }
}

async function failIdempotencyKeySafe(
  pool: DbPool,
  key: string,
  error: unknown
): Promise<void> {
  const reason = error instanceof Error ? error.message : "Unknown error";

  try {
    await withTransaction(pool, (client) =>
      failIdempotencyKey(client, key, reason)
    );
  } catch {
    // Best-effort cleanup; original error remains authoritative.
  }
}

export async function getWalletBalance(
  pool: DbPool,
  userId: string
): Promise<bigint> {
  const result = await pool.query<{ gold_balance: string }>(
    `SELECT gold_balance FROM users WHERE id = $1`,
    [userId]
  );

  if (!result.rowCount) {
    throw new Error(`User ${userId} not found`);
  }

  return parseBigInt(result.rows[0].gold_balance);
}
