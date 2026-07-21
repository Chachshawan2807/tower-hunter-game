import type { DbPool } from "../db/client";
import {
  getWalletBalance,
  listWalletLedger,
  processWalletTransaction,
  processWalletTransactionClient,
} from "../db/wallet";
import type {
  WalletLedgerRow,
  WalletTransactionRequest,
  WalletTransactionResult,
} from "../db/types";

export type { WalletTransactionRequest, WalletTransactionResult };

/**
 * Repository facade for wallet ledger operations (BIGINT + row-level locking).
 */
export const walletRepository = {
  getBalance(pool: DbPool, userId: string): Promise<bigint> {
    return getWalletBalance(pool, userId);
  },

  listLedger(
    pool: DbPool,
    userId: string,
    limit?: number
  ): Promise<WalletLedgerRow[]> {
    return listWalletLedger(pool, userId, limit);
  },

  processTransaction(
    pool: DbPool,
    request: WalletTransactionRequest
  ): Promise<WalletTransactionResult> {
    return processWalletTransaction(pool, request);
  },

  processTransactionClient(
    client: Parameters<typeof processWalletTransactionClient>[0],
    request: WalletTransactionRequest
  ): Promise<WalletTransactionResult> {
    return processWalletTransactionClient(client, request);
  },
};
