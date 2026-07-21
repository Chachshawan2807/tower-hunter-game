import { apiRequest } from "./request";
import type { ShopCatalogItem } from "./types";

export const shopApi = {
  getShopCatalog() {
    return apiRequest<{ items: ShopCatalogItem[] }>("/api/shop/catalog");
  },

  purchaseShopItem(userId: string, itemId: string, idempotencyKey: string) {
    return apiRequest<{
      itemId: string;
      quantity: number;
      goldSpent: string;
      balanceAfter: string;
      inventoryOutcome: string;
    }>(`/api/shop/${userId}/purchase`, {
      method: "POST",
      body: JSON.stringify({ itemId, idempotencyKey, quantity: 1 }),
    });
  },

  sellShopItem(userId: string, inventoryId: string, idempotencyKey: string) {
    return apiRequest<{
      itemId: string;
      goldReceived: string;
      balanceAfter: string;
    }>(`/api/shop/${userId}/sell`, {
      method: "POST",
      body: JSON.stringify({ inventoryId, idempotencyKey }),
    });
  },
};
