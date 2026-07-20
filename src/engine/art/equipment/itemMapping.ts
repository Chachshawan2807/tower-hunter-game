import type { SkillPath } from "../../types";
import { isShopEquipItemId } from "../../shop/shopEquip";
import { resolveShopEquippable } from "../../shop/shopItemMapping";
import { GEAR_CATALOG, getGearEntry } from "./catalog";
import type { EquipmentSlot } from "./slots";

export interface EquippableItem {
  gearId: string;
  slot: EquipmentSlot;
}

/**
 * Resolves an inventory item_id to a catalog gear_id if equippable.
 * Supports `gear.*` starter ids and `shop_equip_*` shop purchases.
 */
export function resolveEquippableItem(
  itemId: string,
  playerPath: SkillPath
): EquippableItem | null {
  const shop = resolveShopEquippable(itemId);
  if (shop) {
    return { gearId: itemId, slot: shop.slot };
  }

  if (GEAR_CATALOG[itemId]) {
    const entry = GEAR_CATALOG[itemId];
    if (entry.path !== playerPath) return null;
    return { gearId: itemId, slot: entry.slot };
  }

  return null;
}

export function isEquippableItem(itemId: string, playerPath: SkillPath): boolean {
  if (isShopEquipItemId(itemId)) {
    return resolveShopEquippable(itemId) !== null;
  }
  return resolveEquippableItem(itemId, playerPath) !== null;
}

export function resolveEquippedGearLabelKey(gearId: string): string | null {
  if (isShopEquipItemId(gearId)) return null;
  return getGearEntry(gearId)?.nameKey ?? null;
}
