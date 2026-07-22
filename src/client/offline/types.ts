export type OfflineActionKind =
  | "shop_purchase"
  | "shop_sell"
  | "equip_from_bag"
  | "unequip_slot"
  | "skill_loadout"
  | "skill_unlock"
  | "skill_upgrade"
  | "skill_respec"
  | "status_allocate"
  | "status_reset"
  | "battle_start"
  | "battle_step"
  | "battle_intent";

export interface OfflineQueueItem {
  id: string;
  userId: string;
  kind: OfflineActionKind;
  idempotencyKey: string;
  payload: Record<string, string>;
  createdAt: string;
  attempts: number;
}

export const OFFLINE_FLUSH_EVENT = "tower-hunter:offline-flushed";

export interface OfflineFlushDetail {
  flushed: number;
  hadBattleActions: boolean;
}
