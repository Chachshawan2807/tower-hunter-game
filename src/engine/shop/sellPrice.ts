import { findEquipmentShopItem } from "./equipmentShopItems";

export function resolveShopItemSellPrice(itemId: string): bigint | null {
  const item = findEquipmentShopItem(itemId);
  if (!item) return null;
  return item.cost / 2n;
}
