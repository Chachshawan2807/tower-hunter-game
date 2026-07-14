import type { SkillPath } from "../../types";
import type { PlayerEquipmentLoadout } from "./slots";

/** Starter gear per skill path — raw iron / worn cloth (Art Bible §07) */
export const DEFAULT_EQUIPMENT_BY_PATH: Record<SkillPath, PlayerEquipmentLoadout> = {
  murim: {
    weapon: { gearId: "gear.murim.weapon.katana", rarity: "common" },
    helm: { gearId: "gear.murim.helm.headband", rarity: "common" },
    chest: { gearId: "gear.murim.chest.robe", rarity: "common" },
    gloves: { gearId: "gear.murim.gloves.wraps", rarity: "common" },
    boots: { gearId: "gear.murim.boots.sandals", rarity: "common" },
    cloak: { gearId: "gear.murim.cloak.sash", rarity: "common" },
  },
  knight: {
    weapon: { gearId: "gear.knight.weapon.greatsword", rarity: "common" },
    helm: { gearId: "gear.knight.helm.visored", rarity: "common" },
    chest: { gearId: "gear.knight.chest.plate", rarity: "common" },
    gloves: { gearId: "gear.knight.gloves.gauntlets", rarity: "common" },
    boots: { gearId: "gear.knight.boots.greaves", rarity: "common" },
    cloak: { gearId: "gear.knight.cloak.cape", rarity: "common" },
  },
  fantasy: {
    weapon: { gearId: "gear.fantasy.weapon.wand", rarity: "common" },
    helm: { gearId: "gear.fantasy.helm.hood", rarity: "common" },
    chest: { gearId: "gear.fantasy.chest.leathers", rarity: "common" },
    gloves: { gearId: "gear.fantasy.gloves.bracers", rarity: "common" },
    boots: { gearId: "gear.fantasy.boots.treads", rarity: "common" },
    cloak: { gearId: "gear.fantasy.cloak.bone", rarity: "common" },
  },
};
