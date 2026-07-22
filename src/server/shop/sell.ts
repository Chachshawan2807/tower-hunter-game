import { isShopEquipItemId } from "../../engine/shop/shopEquip";
import { findShopItem } from "./catalog";
import {
  getInventoryItemById,
  isGearEquipped,
  removeInventoryQuantity,
  processWalletTransactionClient,
  withTransaction,
  type DbPool,
} from "../db";
import {
  completeIdempotencyPayload,
  parseCachedOperationPayload,
  reserveIdempotencyKey,
} from "../db/idempotency";

export class ShopSellError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "ShopSellError";
  }
}

export interface ShopSellInput {
  userId: string;
  inventoryId: string;
  idempotencyKey: string;
}

export interface ShopSellResult {
  itemId: string;
  goldReceived: bigint;
  balanceAfter: bigint;
}

function buildShopSellKey(idempotencyKey: string): string {
  return `shop:sell:${idempotencyKey}`;
}

function serializeSellResult(result: ShopSellResult): Record<string, unknown> {
  return {
    kind: "shop_sell",
    itemId: result.itemId,
    goldReceived: result.goldReceived.toString(),
    balanceAfter: result.balanceAfter.toString(),
  };
}

function deserializeSellResult(payload: Record<string, unknown>): ShopSellResult {
  return {
    itemId: String(payload.itemId),
    goldReceived: BigInt(String(payload.goldReceived)),
    balanceAfter: BigInt(String(payload.balanceAfter)),
  };
}

export async function sellShopItem(
  pool: DbPool,
  input: ShopSellInput
): Promise<ShopSellResult> {
  const operationKey = buildShopSellKey(input.idempotencyKey);

  return withTransaction(pool, async (client) => {
    const reservation = await reserveIdempotencyKey(client, {
      key: operationKey,
      userId: input.userId,
      operation: "shop_sell",
    });

    if (reservation.replay && reservation.cachedPayload) {
      return deserializeSellResult(
        parseCachedOperationPayload(reservation.cachedPayload)
      );
    }

    const invRow = await getInventoryItemById(client, input.userId, input.inventoryId);
    if (!invRow) {
      throw new ShopSellError("Inventory item not found", "ITEM_NOT_FOUND");
    }

    if (!isShopEquipItemId(invRow.item_id)) {
      throw new ShopSellError("Only shop gear can be sold", "NOT_SELLABLE");
    }

    const catalogItem = findShopItem(invRow.item_id);
    if (!catalogItem) {
      throw new ShopSellError("Shop item not found in catalog", "CATALOG_NOT_FOUND");
    }

    const equipped = await isGearEquipped(client, input.userId, invRow.item_id);
    if (equipped) {
      throw new ShopSellError("Unequip item before selling", "ITEM_EQUIPPED");
    }

    const sellPrice = catalogItem.sellPrice;
    await removeInventoryQuantity(client, input.userId, input.inventoryId, 1);

    const walletResult = await processWalletTransactionClient(client, {
      idempotencyKey: `wallet:${input.idempotencyKey}`,
      userId: input.userId,
      amount: sellPrice,
      type: "sell",
      metadata: {
        shopItemId: invRow.item_id,
        inventoryId: input.inventoryId,
      },
    });

    const result: ShopSellResult = {
      itemId: invRow.item_id,
      goldReceived: sellPrice,
      balanceAfter: walletResult.balanceAfter,
    };

    await completeIdempotencyPayload(
      client,
      operationKey,
      serializeSellResult(result)
    );

    return result;
  });
}
