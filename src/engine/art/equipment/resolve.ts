import type { SkillPath } from "../../types";
import { isShopEquipItemId } from "../../shop/shopEquip";
import type { WeaponCategoryId } from "../weaponTypes";
import {
  type CharacterEquipmentVisual,
  getGearEntry,
} from "./catalog";
import { DEFAULT_WEAPON_BY_PATH } from "./defaults";
import {
  EQUIPMENT_SLOTS,
  type EquipmentSlot,
  type EquippedPiece,
  type PlayerEquipmentLoadout,
} from "./slots";

function acceptsEquippedPiece(
  path: SkillPath,
  slot: EquipmentSlot,
  piece: EquippedPiece
): boolean {
  if (isShopEquipItemId(piece.gearId)) return true;
  const entry = getGearEntry(piece.gearId);
  return Boolean(entry && entry.path === path && entry.slot === slot);
}

export function mergeEquipmentLoadout(
  path: SkillPath,
  serverSlots?: Partial<PlayerEquipmentLoadout>
): PlayerEquipmentLoadout {
  const merged: PlayerEquipmentLoadout = {};

  if (!serverSlots) return merged;

  for (const slot of EQUIPMENT_SLOTS) {
    const piece = serverSlots[slot];
    if (!piece) continue;
    if (acceptsEquippedPiece(path, slot, piece)) {
      merged[slot] = piece;
    }
  }

  return merged;
}

export function isEquipmentSlotEquipped(
  visual: CharacterEquipmentVisual,
  slot: EquipmentSlot
): boolean {
  return Boolean(visual.gearIds[slot]);
}

export function loadoutToCharacterVisual(
  path: SkillPath,
  loadout: PlayerEquipmentLoadout
): CharacterEquipmentVisual {
  const weaponPiece = loadout.weapon;
  const weaponEntry = weaponPiece ? getGearEntry(weaponPiece.gearId) : null;
  const weapon: WeaponCategoryId =
    weaponEntry?.weaponId ?? DEFAULT_WEAPON_BY_PATH[path];

  const pieceRarity: Partial<Record<EquipmentSlot, EquippedPiece["rarity"]>> = {};
  const gearIds: Partial<Record<EquipmentSlot, string>> = {};
  for (const slot of EQUIPMENT_SLOTS) {
    const piece = loadout[slot];
    if (!piece) continue;
    pieceRarity[slot] = piece.rarity;
    gearIds[slot] = piece.gearId;
  }

  return {
    path,
    weapon,
    helm: loadout.helm?.gearId ?? "",
    chest: loadout.chest?.gearId ?? "",
    gloves: loadout.gloves?.gearId ?? "",
    boots: loadout.boots?.gearId ?? "",
    cloak: loadout.cloak?.gearId ?? "",
    weaponRarity: loadout.weapon?.rarity ?? "common",
    pieceRarity,
    gearIds,
  };
}

export function resolveCharacterEquipment(
  path: SkillPath,
  serverSlots?: Partial<PlayerEquipmentLoadout>
): CharacterEquipmentVisual {
  return loadoutToCharacterVisual(path, mergeEquipmentLoadout(path, serverSlots));
}
