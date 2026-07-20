import type { SkillPath } from "../../types";
import { isShopEquipItemId } from "../../shop/shopEquip";
import type { WeaponCategoryId } from "../weaponTypes";
import {
  type CharacterEquipmentVisual,
  getGearEntry,
} from "./catalog";
import { DEFAULT_EQUIPMENT_BY_PATH } from "./defaults";
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
  const base = DEFAULT_EQUIPMENT_BY_PATH[path];
  const merged = { ...base };

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

export function loadoutToCharacterVisual(
  path: SkillPath,
  loadout: PlayerEquipmentLoadout
): CharacterEquipmentVisual {
  const weaponEntry = getGearEntry(loadout.weapon.gearId);
  const weapon: WeaponCategoryId = weaponEntry?.weaponId ?? "katana";

  const pieceRarity: Partial<Record<EquipmentSlot, EquippedPiece["rarity"]>> = {};
  const gearIds: Partial<Record<EquipmentSlot, string>> = {};
  for (const slot of EQUIPMENT_SLOTS) {
    pieceRarity[slot] = loadout[slot].rarity;
    gearIds[slot] = loadout[slot].gearId;
  }

  return {
    path,
    weapon,
    helm: loadout.helm.gearId,
    chest: loadout.chest.gearId,
    gloves: loadout.gloves.gearId,
    boots: loadout.boots.gearId,
    cloak: loadout.cloak.gearId,
    weaponRarity: loadout.weapon.rarity,
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
