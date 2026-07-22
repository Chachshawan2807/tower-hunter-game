import {
  addItemToInventoryClient,
  withTransaction,
  type DbPool,
} from "../db";
import {
  completeIdempotencyPayload,
  parseCachedOperationPayload,
  reserveIdempotencyKey,
} from "../db/idempotency";
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

function buildShopPurchaseKey(idempotencyKey: string): string {
  return `shop:purchase:${idempotencyKey}`;
}

function serializePurchaseResult(result: ShopPurchaseResult): Record<string, unknown> {
  return {
    kind: "shop_purchase",
    itemId: result.itemId,
    quantity: result.quantity,
    goldSpent: result.goldSpent.toString(),
    balanceAfter: result.balanceAfter.toString(),
    inventoryOutcome: result.inventoryOutcome,
  };
}

function deserializePurchaseResult(
  payload: Record<string, unknown>
): ShopPurchaseResult {
  return {
    itemId: String(payload.itemId),
    quantity: Number(payload.quantity),
    goldSpent: BigInt(String(payload.goldSpent)),
    balanceAfter: BigInt(String(payload.balanceAfter)),
    inventoryOutcome: String(payload.inventoryOutcome),
  };
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
  const operationKey = buildShopPurchaseKey(input.idempotencyKey);

  try {
    return await withTransaction(pool, async (client) => {
      const reservation = await reserveIdempotencyKey(client, {
        key: operationKey,
        userId: input.userId,
        operation: "shop_purchase",
      });

      if (reservation.replay && reservation.cachedPayload) {
        return deserializePurchaseResult(
          parseCachedOperationPayload(reservation.cachedPayload)
        );
      }

      const walletResult = await processWalletTransactionClient(client, {
        idempotencyKey: `wallet:${input.idempotencyKey}`,
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

      const result: ShopPurchaseResult = {
        itemId: catalogItem.id,
        quantity,
        goldSpent: totalCost,
        balanceAfter: walletResult.balanceAfter,
        inventoryOutcome: addResult.outcome,
      };

      await completeIdempotencyPayload(
        client,
        operationKey,
        serializePurchaseResult(result)
      );

      return result;
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
