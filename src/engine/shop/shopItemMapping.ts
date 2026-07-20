import type { EquipmentSlot } from "../art/equipment/slots";
import { resolveSlotFromAssetPrefix } from "./equipmentShopStats";
import { getEquipmentShopAssetKey } from "./equipmentShopItems";

export { resolveSlotFromAssetPrefix };

export function resolveShopEquippable(itemId: string): {
  slot: EquipmentSlot;
  assetKey: string;
} | null {
  const assetKey = getEquipmentShopAssetKey(itemId);
  if (!assetKey) return null;

  const prefix = assetKey.replace(/-\d{2}$/, "");
  return { slot: resolveSlotFromAssetPrefix(prefix), assetKey };
}
