import type { GearStatBonus } from "../art/equipment/statBonuses";
import { EQUIPMENT_SHOP_ITEMS } from "./equipmentShopItems";

const STATS_BY_SHOP_ID = new Map(
  EQUIPMENT_SHOP_ITEMS.map((item) => [item.id, item.stats])
);

export function getShopItemStats(itemId: string): GearStatBonus | undefined {
  return STATS_BY_SHOP_ID.get(itemId);
}
