import type { SkillPath } from "../../types";
import type { WeaponCategoryId, ItemRarityVisual } from "../weaponTypes";
import type { EquipmentSlot } from "./slots";

export interface GearCatalogEntry {
  id: string;
  slot: EquipmentSlot;
  path: SkillPath;
  nameKey: string;
  weaponId?: WeaponCategoryId;
}

/** Server-persisted gear_id values */
export const GEAR_CATALOG: Record<string, GearCatalogEntry> = {
  "gear.imperial.weapon.katana": {
    id: "gear.imperial.weapon.katana",
    slot: "weapon",
    path: "imperial",
    nameKey: "weapon.katana",
    weaponId: "katana",
  },
  "gear.imperial.helm.headband": {
    id: "gear.imperial.helm.headband",
    slot: "helm",
    path: "imperial",
    nameKey: "gear.imperial.helm.headband",
  },
  "gear.imperial.chest.robe": {
    id: "gear.imperial.chest.robe",
    slot: "chest",
    path: "imperial",
    nameKey: "gear.imperial.chest.robe",
  },
  "gear.imperial.gloves.wraps": {
    id: "gear.imperial.gloves.wraps",
    slot: "gloves",
    path: "imperial",
    nameKey: "gear.imperial.gloves.wraps",
  },
  "gear.imperial.boots.sandals": {
    id: "gear.imperial.boots.sandals",
    slot: "boots",
    path: "imperial",
    nameKey: "gear.imperial.boots.sandals",
  },
  "gear.imperial.cloak.sash": {
    id: "gear.imperial.cloak.sash",
    slot: "cloak",
    path: "imperial",
    nameKey: "gear.imperial.cloak.sash",
  },
  "gear.knight.weapon.greatsword": {
    id: "gear.knight.weapon.greatsword",
    slot: "weapon",
    path: "knight",
    nameKey: "weapon.greatsword",
    weaponId: "greatsword",
  },
  "gear.knight.helm.visored": {
    id: "gear.knight.helm.visored",
    slot: "helm",
    path: "knight",
    nameKey: "gear.knight.helm.visored",
  },
  "gear.knight.chest.plate": {
    id: "gear.knight.chest.plate",
    slot: "chest",
    path: "knight",
    nameKey: "gear.knight.chest.plate",
  },
  "gear.knight.gloves.gauntlets": {
    id: "gear.knight.gloves.gauntlets",
    slot: "gloves",
    path: "knight",
    nameKey: "gear.knight.gloves.gauntlets",
  },
  "gear.knight.boots.greaves": {
    id: "gear.knight.boots.greaves",
    slot: "boots",
    path: "knight",
    nameKey: "gear.knight.boots.greaves",
  },
  "gear.knight.cloak.cape": {
    id: "gear.knight.cloak.cape",
    slot: "cloak",
    path: "knight",
    nameKey: "gear.knight.cloak.cape",
  },
  "gear.fantasy.weapon.wand": {
    id: "gear.fantasy.weapon.wand",
    slot: "weapon",
    path: "vanguard",
    nameKey: "weapon.wand",
    weaponId: "wand",
  },
  "gear.fantasy.helm.hood": {
    id: "gear.fantasy.helm.hood",
    slot: "helm",
    path: "vanguard",
    nameKey: "gear.fantasy.helm.hood",
  },
  "gear.fantasy.chest.leathers": {
    id: "gear.fantasy.chest.leathers",
    slot: "chest",
    path: "vanguard",
    nameKey: "gear.fantasy.chest.leathers",
  },
  "gear.fantasy.gloves.bracers": {
    id: "gear.fantasy.gloves.bracers",
    slot: "gloves",
    path: "vanguard",
    nameKey: "gear.fantasy.gloves.bracers",
  },
  "gear.fantasy.boots.treads": {
    id: "gear.fantasy.boots.treads",
    slot: "boots",
    path: "vanguard",
    nameKey: "gear.fantasy.boots.treads",
  },
  "gear.fantasy.cloak.bone": {
    id: "gear.fantasy.cloak.bone",
    slot: "cloak",
    path: "vanguard",
    nameKey: "gear.fantasy.cloak.bone",
  },
};

export interface CharacterEquipmentVisual {
  path: SkillPath;
  weapon: WeaponCategoryId;
  helm: string;
  chest: string;
  gloves: string;
  boots: string;
  cloak: string;
  weaponRarity: ItemRarityVisual;
  pieceRarity: Partial<Record<EquipmentSlot, ItemRarityVisual>>;
  gearIds: Partial<Record<EquipmentSlot, string>>;
}

export function getGearEntry(gearId: string): GearCatalogEntry | null {
  return GEAR_CATALOG[gearId] ?? null;
}
