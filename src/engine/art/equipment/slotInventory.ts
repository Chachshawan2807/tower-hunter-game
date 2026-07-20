import type { SkillPath } from "../../types";
import { resolveEquippableItem } from "./itemMapping";
import type { EquipmentSlot } from "./slots";

export interface InventoryBagEntry {
  inventoryId: string;
  itemId: string;
  rarity: string;
}

export function filterInventoryForEquipmentSlot(
  inventory: InventoryBagEntry[],
  slot: EquipmentSlot,
  skillPath: SkillPath
): InventoryBagEntry[] {
  return inventory.filter((entry) => {
    const equippable = resolveEquippableItem(entry.itemId, skillPath);
    return equippable?.slot === slot;
  });
}
