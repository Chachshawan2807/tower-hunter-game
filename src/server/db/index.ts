export {
  createDbPool,
  getDbPool,
  closeDbPool,
  withTransaction,
  parseBigInt,
  type DbPool,
  type DbClient,
} from "./client";

export {
  reserveIdempotencyKey,
  completeIdempotencyKey,
  failIdempotencyKey,
  buildWalletOperationKey,
  type IdempotencyReservation,
} from "./idempotency";

export {
  processWalletTransaction,
  processWalletTransactionClient,
  getWalletBalance,
} from "./wallet";

export {
  createUser,
  getUserById,
  setAutoDismantleCommon,
} from "./users";

export {
  getPlayerStats,
  toCombatStats,
  applyBattleWinProgress,
  type PlayerStatsRow,
} from "./playerStats";

export {
  addItemToInventory,
  listInventoryItems,
  countInventoryQuantity,
  COMMON_DISMANTLE_GOLD,
} from "./inventory";

export {
  addToMailbox,
  addToMailboxClient,
  listMailboxItems,
  purgeExpiredMailboxItems,
  claimMailboxItem,
  computeMailboxExpiry,
  type MailboxItemInput,
} from "./mailbox";

export {
  getLocalizedString,
  getLocalizedStringWithFallback,
  upsertLocalizedString,
  listLocalizedStrings,
} from "./localization";

export {
  DbError,
  IdempotencyConflictError,
  InsufficientGoldError,
  type UserRow,
  type IdempotencyKeyRow,
  type WalletLedgerRow,
  type InventoryItemRow,
  type MailboxItemRow,
  type LocalizationRow,
  type WalletTransactionRequest,
  type WalletTransactionResult,
  type InventoryItemInput,
  type AddItemResult,
  type AddItemOutcome,
  type SupportedLocale,
  type ItemRarity,
  type WalletTransactionType,
} from "./types";

export type { DbClientConfig } from "./types";
