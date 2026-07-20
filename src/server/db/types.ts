export interface DbClientConfig {
  connectionString: string;
  maxConnections?: number;
}

export type SupportedLocale = "th" | "en";

export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export type IdempotencyStatus = "processing" | "completed" | "failed";

export type WalletTransactionType =
  | "reward"
  | "purchase"
  | "sell"
  | "admin_adjustment";

export interface UserRow {
  id: string;
  external_id: string;
  display_name: string;
  gold_balance: bigint;
  preferred_locale: SupportedLocale;
  created_at: Date;
  updated_at: Date;
}

export interface IdempotencyKeyRow {
  key: string;
  user_id: string;
  operation: string;
  status: IdempotencyStatus;
  response_payload: Record<string, unknown> | null;
  created_at: Date;
  completed_at: Date | null;
}

export interface WalletLedgerRow {
  id: string;
  user_id: string;
  amount: string;
  transaction_type: WalletTransactionType;
  idempotency_key: string;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export interface InventoryItemRow {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  rarity: ItemRarity;
  created_at: Date;
  updated_at: Date;
}

export interface MailboxItemRow {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  rarity: ItemRarity;
  source_floor: number | null;
  expires_at: Date;
  created_at: Date;
}

export interface LocalizationRow {
  string_id: string;
  locale: SupportedLocale;
  text_value: string;
  updated_at: Date;
}

export interface WalletTransactionRequest {
  idempotencyKey: string;
  userId: string;
  amount: bigint;
  type: WalletTransactionType;
  metadata?: Record<string, unknown>;
}

export interface WalletTransactionResult {
  ledgerId: string;
  userId: string;
  amount: bigint;
  balanceAfter: bigint;
  idempotencyKey: string;
  replayed: boolean;
}

export interface InventoryItemInput {
  itemId: string;
  quantity: number;
  rarity: ItemRarity;
  sourceFloor?: number;
}

export type AddItemOutcome = "inventory" | "mailbox";

export interface AddItemResult {
  outcome: AddItemOutcome;
  itemId: string;
  quantity: number;
  mailboxId?: string;
}

export class DbError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "DbError";
  }
}

export class IdempotencyConflictError extends DbError {
  constructor(key: string) {
    super(`Idempotency key "${key}" is already processing`, "IDEMPOTENCY_CONFLICT");
    this.name = "IdempotencyConflictError";
  }
}

export class InsufficientGoldError extends DbError {
  constructor(userId: string) {
    super(`Insufficient gold for user ${userId}`, "INSUFFICIENT_GOLD");
    this.name = "InsufficientGoldError";
  }
}
