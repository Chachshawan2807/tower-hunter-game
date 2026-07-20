import { getEquipmentShopAssetKey } from "../../shop/equipmentShopItems";
import { getGearEntry } from "./catalog";
import type { EquipmentSlot } from "./slots";

/** Catalog gear_id → equipment-items SVG asset key */
const GEAR_ICON_ASSET: Record<string, string> = {
  "gear.imperial.weapon.katana": "weapon-sword-01",
  "gear.imperial.helm.headband": "helm-01",
  "gear.imperial.chest.robe": "chest-01",
  "gear.imperial.gloves.wraps": "gloves-01",
  "gear.imperial.boots.sandals": "boots-01",
  "gear.imperial.cloak.sash": "cloak-01",
  "gear.knight.weapon.greatsword": "weapon-sword-02",
  "gear.knight.helm.visored": "helm-02",
  "gear.knight.chest.plate": "chest-02",
  "gear.knight.gloves.gauntlets": "gloves-02",
  "gear.knight.boots.greaves": "boots-02",
  "gear.knight.cloak.cape": "cloak-02",
  "gear.fantasy.weapon.wand": "weapon-sword-cross-01",
  "gear.fantasy.helm.hood": "helm-03",
  "gear.fantasy.chest.leathers": "chest-03",
  "gear.fantasy.gloves.bracers": "gloves-03",
  "gear.fantasy.boots.treads": "boots-03",
  "gear.fantasy.cloak.bone": "cloak-03",
};

const SLOT_FALLBACK_ASSET: Record<EquipmentSlot, string> = {
  weapon: "weapon-sword-01",
  helm: "helm-01",
  chest: "chest-01",
  gloves: "gloves-01",
  boots: "boots-01",
  cloak: "cloak-01",
};

/** Resolves a gear/item id to an equipment-items SVG asset key. */
export function resolveEquipmentIconAsset(gearId: string): string | null {
  const shopAsset = getEquipmentShopAssetKey(gearId);
  if (shopAsset) return shopAsset;

  const mapped = GEAR_ICON_ASSET[gearId];
  if (mapped) return mapped;

  const entry = getGearEntry(gearId);
  if (entry) return SLOT_FALLBACK_ASSET[entry.slot];

  return null;
}

export function equipmentIconUrl(gearId: string): string | null {
  const assetKey = resolveEquipmentIconAsset(gearId);
  return assetKey ? `/icons/equipment-items/${assetKey}.svg` : null;
}
