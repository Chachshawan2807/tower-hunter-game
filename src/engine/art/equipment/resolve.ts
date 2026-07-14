import type { SkillPath } from "../../types";
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
    const entry = getGearEntry(piece.gearId);
    if (entry && entry.path === path && entry.slot === slot) {
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
  for (const slot of EQUIPMENT_SLOTS) {
    pieceRarity[slot] = loadout[slot].rarity;
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
  };
}

export function resolveCharacterEquipment(
  path: SkillPath,
  serverSlots?: Partial<PlayerEquipmentLoadout>
): CharacterEquipmentVisual {
  return loadoutToCharacterVisual(path, mergeEquipmentLoadout(path, serverSlots));
}
