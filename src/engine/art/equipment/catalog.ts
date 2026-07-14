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
  "gear.murim.weapon.katana": {
    id: "gear.murim.weapon.katana",
    slot: "weapon",
    path: "murim",
    nameKey: "weapon.katana",
    weaponId: "katana",
  },
  "gear.murim.helm.headband": {
    id: "gear.murim.helm.headband",
    slot: "helm",
    path: "murim",
    nameKey: "gear.murim.helm.headband",
  },
  "gear.murim.chest.robe": {
    id: "gear.murim.chest.robe",
    slot: "chest",
    path: "murim",
    nameKey: "gear.murim.chest.robe",
  },
  "gear.murim.gloves.wraps": {
    id: "gear.murim.gloves.wraps",
    slot: "gloves",
    path: "murim",
    nameKey: "gear.murim.gloves.wraps",
  },
  "gear.murim.boots.sandals": {
    id: "gear.murim.boots.sandals",
    slot: "boots",
    path: "murim",
    nameKey: "gear.murim.boots.sandals",
  },
  "gear.murim.cloak.sash": {
    id: "gear.murim.cloak.sash",
    slot: "cloak",
    path: "murim",
    nameKey: "gear.murim.cloak.sash",
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
    path: "fantasy",
    nameKey: "weapon.wand",
    weaponId: "wand",
  },
  "gear.fantasy.helm.hood": {
    id: "gear.fantasy.helm.hood",
    slot: "helm",
    path: "fantasy",
    nameKey: "gear.fantasy.helm.hood",
  },
  "gear.fantasy.chest.leathers": {
    id: "gear.fantasy.chest.leathers",
    slot: "chest",
    path: "fantasy",
    nameKey: "gear.fantasy.chest.leathers",
  },
  "gear.fantasy.gloves.bracers": {
    id: "gear.fantasy.gloves.bracers",
    slot: "gloves",
    path: "fantasy",
    nameKey: "gear.fantasy.gloves.bracers",
  },
  "gear.fantasy.boots.treads": {
    id: "gear.fantasy.boots.treads",
    slot: "boots",
    path: "fantasy",
    nameKey: "gear.fantasy.boots.treads",
  },
  "gear.fantasy.cloak.bone": {
    id: "gear.fantasy.cloak.bone",
    slot: "cloak",
    path: "fantasy",
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
}

export function getGearEntry(gearId: string): GearCatalogEntry | null {
  return GEAR_CATALOG[gearId] ?? null;
}
