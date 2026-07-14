import type { SkillPath } from "../../types";
import { GEAR_CATALOG, getGearEntry } from "./catalog";
import { DEFAULT_EQUIPMENT_BY_PATH } from "./defaults";
import { EQUIPMENT_SLOTS, type EquipmentSlot } from "./slots";

export interface EquippableItem {
  gearId: string;
  slot: EquipmentSlot;
}

/**
 * Resolves an inventory item_id to a catalog gear_id if equippable.
 * Supports direct `gear.*` ids and tower drop ids (`drop_f*` / `item.drop.floor_*`).
 */
export function resolveEquippableItem(
  itemId: string,
  playerPath: SkillPath
): EquippableItem | null {
  if (GEAR_CATALOG[itemId]) {
    const entry = GEAR_CATALOG[itemId];
    if (entry.path !== playerPath) return null;
    return { gearId: itemId, slot: entry.slot };
  }

  const floorMatch =
    itemId.match(/^drop_f(\d+)_/i) ??
    itemId.match(/floor[._](\d+)/i);

  if (!floorMatch) return null;

  const floor = Number(floorMatch[1]);
  if (!Number.isFinite(floor) || floor <= 0) return null;

  const slot = EQUIPMENT_SLOTS[(floor - 1) % EQUIPMENT_SLOTS.length];
  const gearId = DEFAULT_EQUIPMENT_BY_PATH[playerPath][slot].gearId;
  const entry = getGearEntry(gearId);
  if (!entry || entry.path !== playerPath) return null;

  return { gearId, slot };
}

export function isEquippableItem(itemId: string, playerPath: SkillPath): boolean {
  return resolveEquippableItem(itemId, playerPath) !== null;
}
