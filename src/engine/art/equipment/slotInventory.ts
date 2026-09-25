import type { SkillPath } from "../../types";
import { resolveEquippableItem } from "./itemMapping";
import type { EquipmentSlot } from "./slots";

export interface InventoryBagEntry {
  inventoryId: string;
  itemId: string;
  rarity: string;
  /** Last shop purchase / quantity add (inventory updated_at). */
  lastPurchasedAtMs: number;
  /** Last time this stack was equipped (null if never). */
  lastEquippedAtMs: number | null;
}

function compareSlotPickerEntries(a: InventoryBagEntry, b: InventoryBagEntry): number {
  if (b.lastPurchasedAtMs !== a.lastPurchasedAtMs) {
    return b.lastPurchasedAtMs - a.lastPurchasedAtMs;
  }
  const equippedA = a.lastEquippedAtMs ?? 0;
  const equippedB = b.lastEquippedAtMs ?? 0;
  if (equippedB !== equippedA) {
    return equippedB - equippedA;
  }
  return a.inventoryId.localeCompare(b.inventoryId);
}

export function sortInventoryForEquipmentSlotPicker(
  entries: InventoryBagEntry[]
): InventoryBagEntry[] {
  return [...entries].sort(compareSlotPickerEntries);
}

export function filterInventoryForEquipmentSlot(
  inventory: InventoryBagEntry[],
  slot: EquipmentSlot,
  skillPath: SkillPath
): InventoryBagEntry[] {
  const filtered = inventory.filter((entry) => {
    const equippable = resolveEquippableItem(entry.itemId, skillPath);
    return equippable?.slot === slot;
  });
  return sortInventoryForEquipmentSlotPicker(filtered);
}
