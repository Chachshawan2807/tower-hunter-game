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

export async function sellShopItem(
  pool: DbPool,
  input: ShopSellInput
): Promise<ShopSellResult> {
  return withTransaction(pool, async (client) => {
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
      idempotencyKey: input.idempotencyKey,
      userId: input.userId,
      amount: sellPrice,
      type: "sell",
      metadata: {
        shopItemId: invRow.item_id,
        inventoryId: input.inventoryId,
      },
    });

    return {
      itemId: invRow.item_id,
      goldReceived: sellPrice,
      balanceAfter: walletResult.balanceAfter,
    };
  });
}
