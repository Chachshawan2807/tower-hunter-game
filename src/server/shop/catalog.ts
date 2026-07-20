import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { GearStatBonus } from "../../engine/art/equipment/statBonuses";
import { formatStatBonus } from "../../engine/art/equipment/statBonuses";
import { EQUIPMENT_SHOP_ITEMS } from "../../engine/shop/equipmentShopItems";

export interface ShopCatalogItem {
  id: string;
  stringId: string;
  cost: bigint;
  slot: EquipmentSlot;
  stats: GearStatBonus;
  statPreview: string[];
  sellPrice: bigint;
  icon: string;
}

export const SHOP_CATALOG: ShopCatalogItem[] = EQUIPMENT_SHOP_ITEMS.map((item) => ({
  id: item.id,
  stringId: item.stringId,
  cost: item.cost,
  slot: item.slot,
  stats: item.stats,
  statPreview: formatStatBonus(item.stats),
  sellPrice: item.cost / 2n,
  icon: `equip:${item.assetKey}`,
}));

export function findShopItem(itemId: string): ShopCatalogItem | undefined {
  return SHOP_CATALOG.find((item) => item.id === itemId);
}
