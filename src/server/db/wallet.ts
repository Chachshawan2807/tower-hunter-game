/**
 * Wallet ledger operations placeholder.
 * All currency stored as BIGINT (lowest denomination).
 * Append-only ledger with idempotency key support.
 */

export interface WalletTransaction {
  idempotencyKey: string;
  userId: string;
  amount: bigint;
  type: "credit" | "debit";
}

export function processWalletTransaction(_tx: WalletTransaction): void {
  // Implementation pending database setup phase
}
