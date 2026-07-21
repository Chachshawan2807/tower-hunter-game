import { apiRequest } from "./request";
import type {
  EquipFromBagResponse,
  EquipSlotId,
  InventoryItem,
  MailboxItem,
  PlayerEquipmentResponse,
  PlayerStatsResponse,
  StatusAllocateResponse,
  UnequipSlotResponse,
  UserProfile,
} from "./types";

export const userApi = {
  createUser(externalId: string, displayName: string) {
    return apiRequest<UserProfile>("/api/users", {
      method: "POST",
      body: JSON.stringify({ externalId, displayName }),
    });
  },

  getUserByExternalId(externalId: string) {
    return apiRequest<UserProfile>(`/api/users/external/${externalId}`);
  },

  getUser(userId: string) {
    return apiRequest<UserProfile>(`/api/users/${userId}`);
  },

  updateDisplayName(userId: string, displayName: string) {
    return apiRequest<UserProfile>(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ displayName }),
    });
  },

  getPlayerStats(userId: string) {
    return apiRequest<PlayerStatsResponse>(`/api/users/${userId}/stats`);
  },

  allocateStatusPoint(
    userId: string,
    stat:
      | "hp"
      | "mp"
      | "atk"
      | "def"
      | "spd"
      | "crit"
      | "crit_dmg"
      | "resist"
      | "eva"
      | "acc"
  ) {
    return apiRequest<StatusAllocateResponse>(
      `/api/users/${userId}/stats/allocate`,
      {
        method: "POST",
        body: JSON.stringify({ stat }),
      }
    );
  },

  resetStatusAllocations(userId: string) {
    return apiRequest<StatusAllocateResponse>(
      `/api/users/${userId}/stats/reset-status`,
      { method: "POST" }
    );
  },

  getWallet(userId: string) {
    return apiRequest<{ goldBalance: string }>(`/api/users/${userId}/wallet`);
  },

  getInventory(userId: string) {
    return apiRequest<{ items: InventoryItem[] }>(
      `/api/users/${userId}/inventory`
    );
  },

  getPlayerEquipment(userId: string) {
    return apiRequest<PlayerEquipmentResponse>(
      `/api/users/${userId}/equipment`
    );
  },

  equipFromBag(userId: string, slot: EquipSlotId, inventoryId: string) {
    return apiRequest<EquipFromBagResponse>(`/api/users/${userId}/equipment`, {
      method: "PATCH",
      body: JSON.stringify({ slot, inventoryId }),
    });
  },

  unequipSlot(userId: string, slot: EquipSlotId) {
    return apiRequest<UnequipSlotResponse>(
      `/api/users/${userId}/equipment/${slot}`,
      { method: "DELETE" }
    );
  },

  getMailbox(userId: string) {
    return apiRequest<{ items: MailboxItem[] }>(
      `/api/users/${userId}/mailbox`
    );
  },

  claimMailboxItem(userId: string, mailboxItemId: string) {
    return apiRequest<{
      item: MailboxItem;
      inventoryResult: { outcome: string; itemId: string; quantity: number };
    }>(`/api/users/${userId}/mailbox/${mailboxItemId}/claim`, {
      method: "POST",
    });
  },
};
