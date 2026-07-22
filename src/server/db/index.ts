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
  completeIdempotencyPayload,
  failIdempotencyKey,
  buildWalletOperationKey,
  parseCachedOperationPayload,
  type IdempotencyReservation,
} from "./idempotency";

export {
  processWalletTransaction,
  processWalletTransactionClient,
  getWalletBalance,
  listWalletLedger,
} from "./wallet";

export {
  createUser,
  getUserById,
  getUserByExternalId,
  updateDisplayName,
} from "./users";

export {
  getPlayerStats,
  toCombatStats,
  applyBattleWinProgress,
  getPlayerSkillPath,
  statusAllocationsFromRow,
  type PlayerStatsRow,
} from "./playerStats";

export {
  allocateStatusPoint,
  resetStatusAllocations,
  StatusAllocationError,
} from "./statusAllocations";

export {
  getPlayerLoadoutV2,
  upsertPlayerLoadoutV2,
} from "./skillLoadoutV2";

export { respecPlayerSkills } from "./skillRespec";

export {
  getPlayerUpgrades,
  upgradeSkillBranch,
} from "./skillUpgrades";

export {
  getPlayerSkillUnlocks,
  unlockPlayerSkill,
  isSkillUnlockError,
  SkillUnlockError,
} from "./skillUnlocks";

export {
  listPlayerEquipment,
  upsertEquipmentSlot,
  deleteEquipmentSlot,
  rowsToEquipmentDto,
  type PlayerEquipmentDto,
  type EquipmentSlotDto,
} from "./equipment";

export {
  listInventoryItems,
  countInventoryQuantity,
  addItemToInventory,
  addItemToInventoryClient,
  getInventoryItemById,
  removeInventoryQuantity,
  isGearEquipped,
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
