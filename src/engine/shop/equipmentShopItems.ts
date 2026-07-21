import type { EquipmentSlot } from "../art/equipment/slots";
import type { GearStatBonus } from "../art/equipment/statBonuses";
import { getShopRowStats, resolveSlotFromAssetPrefix } from "./equipmentShopStats";
import { EQUIPMENT_SHOP_CATALOG_ROWS } from "./equipmentShopCatalogRows";

export interface EquipmentShopItemDef {
  id: string;
  stringId: string;
  assetKey: string;
  slot: EquipmentSlot;
  cost: bigint;
  stats: GearStatBonus;
  label: { en: string; th: string };
}

const VARIANT_COST_MULT = [1, 1.2, 2, 3.5, 6] as const;

function shopId(prefix: string, variant: number): string {
  const suffix = String(variant).padStart(2, "0");
  return `shop_equip_${prefix.replace(/-/g, "_")}_${suffix}`;
}

export const EQUIPMENT_SHOP_ITEMS: EquipmentShopItemDef[] =
  EQUIPMENT_SHOP_CATALOG_ROWS.flatMap((row) =>
    row.names.en.map((enName, index) => {
      const variant = index + 1;
      const assetKey = `${row.prefix}-${String(variant).padStart(2, "0")}`;
      const cost = BigInt(Math.round(row.baseCost * VARIANT_COST_MULT[index]));
      return {
        id: shopId(row.prefix, variant),
        stringId: `shop.item.equip.${row.prefix.replace(/-/g, "_")}_${String(variant).padStart(2, "0")}`,
        assetKey,
        slot: resolveSlotFromAssetPrefix(row.prefix),
        cost,
        stats: getShopRowStats(row.prefix, index),
        label: { en: enName, th: row.names.th[index] },
      };
    })
  );

const LABEL_BY_ID = new Map(EQUIPMENT_SHOP_ITEMS.map((item) => [item.id, item.label]));

export function getEquipmentShopLabel(itemId: string, locale: "en" | "th"): string | null {
  const label = LABEL_BY_ID.get(itemId);
  return label ? label[locale] : null;
}

export function getEquipmentShopAssetKey(itemId: string): string | null {
  return EQUIPMENT_SHOP_ITEMS.find((item) => item.id === itemId)?.assetKey ?? null;
}

export function findEquipmentShopItem(itemId: string): EquipmentShopItemDef | undefined {
  return EQUIPMENT_SHOP_ITEMS.find((item) => item.id === itemId);
}
