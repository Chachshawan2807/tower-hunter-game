import type { ItemRarity } from "../db/types";
import { EQUIPMENT_SHOP_ITEMS } from "../../engine/shop/equipmentShopItems";

export interface ShopCatalogItem {
  id: string;
  stringId: string;
  cost: bigint;
  rarity: ItemRarity;
  icon: string;
}

export const SHOP_CATALOG: ShopCatalogItem[] = EQUIPMENT_SHOP_ITEMS.map((item) => ({
  id: item.id,
  stringId: item.stringId,
  cost: item.cost,
  rarity: item.rarity,
  icon: `equip:${item.assetKey}`,
}));

export function findShopItem(itemId: string): ShopCatalogItem | undefined {
  return SHOP_CATALOG.find((item) => item.id === itemId);
}
