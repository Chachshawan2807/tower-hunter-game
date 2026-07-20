import {
  addItemToInventoryClient,
  withTransaction,
  type DbPool,
} from "../db";
import { InsufficientGoldError } from "../db/types";
import { processWalletTransactionClient } from "../db/wallet";
import { findShopItem } from "./catalog";

export interface ShopPurchaseInput {
  userId: string;
  itemId: string;
  idempotencyKey: string;
  quantity?: number;
}

export interface ShopPurchaseResult {
  itemId: string;
  quantity: number;
  goldSpent: bigint;
  balanceAfter: bigint;
  inventoryOutcome: string;
}

export async function purchaseShopItem(
  pool: DbPool,
  input: ShopPurchaseInput
): Promise<ShopPurchaseResult> {
  const catalogItem = findShopItem(input.itemId);
  if (!catalogItem) {
    throw new Error(`Shop item "${input.itemId}" not found`);
  }

  const quantity = Math.max(1, Math.min(input.quantity ?? 1, 99));
  const totalCost = catalogItem.cost * BigInt(quantity);

  try {
    return await withTransaction(pool, async (client) => {
      const walletResult = await processWalletTransactionClient(client, {
        idempotencyKey: input.idempotencyKey,
        userId: input.userId,
        amount: totalCost,
        type: "purchase",
        metadata: {
          shopItemId: catalogItem.id,
          quantity,
          unitCost: catalogItem.cost.toString(),
        },
      });

      const addResult = await addItemToInventoryClient(client, input.userId, {
        itemId: catalogItem.id,
        quantity,
        rarity: "common",
      });

      return {
        itemId: catalogItem.id,
        quantity,
        goldSpent: totalCost,
        balanceAfter: walletResult.balanceAfter,
        inventoryOutcome: addResult.outcome,
      };
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Insufficient gold balance")
    ) {
      throw new InsufficientGoldError(input.userId);
    }
    throw error;
  }
}
