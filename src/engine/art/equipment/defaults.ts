import type { SkillPath } from "../../types";
import type { WeaponCategoryId } from "../weaponTypes";
import type { PlayerEquipmentLoadout } from "./slots";

/** Fallback weapon silhouette when no weapon is equipped (paper doll only). */
export const DEFAULT_WEAPON_BY_PATH: Record<SkillPath, WeaponCategoryId> = {
  imperial: "katana",
  knight: "greatsword",
  vanguard: "wand",
};

/** Legacy starter gear per skill path — reference only; new players start unequipped. */
export const DEFAULT_EQUIPMENT_BY_PATH: Record<SkillPath, Required<PlayerEquipmentLoadout>> = {
  imperial: {
    weapon: { gearId: "gear.imperial.weapon.katana", rarity: "common" },
    helm: { gearId: "gear.imperial.helm.headband", rarity: "common" },
    chest: { gearId: "gear.imperial.chest.robe", rarity: "common" },
    gloves: { gearId: "gear.imperial.gloves.wraps", rarity: "common" },
    boots: { gearId: "gear.imperial.boots.sandals", rarity: "common" },
    cloak: { gearId: "gear.imperial.cloak.sash", rarity: "common" },
  },
  knight: {
    weapon: { gearId: "gear.knight.weapon.greatsword", rarity: "common" },
    helm: { gearId: "gear.knight.helm.visored", rarity: "common" },
    chest: { gearId: "gear.knight.chest.plate", rarity: "common" },
    gloves: { gearId: "gear.knight.gloves.gauntlets", rarity: "common" },
    boots: { gearId: "gear.knight.boots.greaves", rarity: "common" },
    cloak: { gearId: "gear.knight.cloak.cape", rarity: "common" },
  },
  vanguard: {
    weapon: { gearId: "gear.fantasy.weapon.wand", rarity: "common" },
    helm: { gearId: "gear.fantasy.helm.hood", rarity: "common" },
    chest: { gearId: "gear.fantasy.chest.leathers", rarity: "common" },
    gloves: { gearId: "gear.fantasy.gloves.bracers", rarity: "common" },
    boots: { gearId: "gear.fantasy.boots.treads", rarity: "common" },
    cloak: { gearId: "gear.fantasy.cloak.bone", rarity: "common" },
  },
};
