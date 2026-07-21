import {
  GEAR_CATALOG,
  getGearEntry,
} from "../../engine/art/equipment";
import { getEquipmentShopLabel } from "../../engine/shop/equipmentShopItems";
import { isShopEquipItemId } from "../../engine/shop/shopEquip";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import { t, type Locale } from "../../utils/i18n";

export const SLOT_LABEL: Record<EquipmentSlot, string> = {
  weapon: "char.slot.weapon",
  helm: "char.slot.helm",
  chest: "char.slot.chest",
  gloves: "char.slot.gloves",
  boots: "char.slot.boots",
  cloak: "char.slot.cloak",
};

export const SLOT_ICON: Record<
  EquipmentSlot,
  "slot-helm" | "slot-chest" | "slot-gloves" | "slot-boots" | "slot-cloak" | "slot-weapon"
> = {
  weapon: "slot-weapon",
  helm: "slot-helm",
  chest: "slot-chest",
  gloves: "slot-gloves",
  boots: "slot-boots",
  cloak: "slot-cloak",
};

export function resolveSlotGearName(
  visual: CharacterEquipmentVisual,
  slot: EquipmentSlot,
  locale: Locale
): string {
  const gearId = visual.gearIds[slot];
  if (!gearId) return t("char.slot.empty", locale);

  if (isShopEquipItemId(gearId)) {
    return getEquipmentShopLabel(gearId, locale) ?? gearId;
  }
  if (slot === "weapon") {
    const match = Object.values(GEAR_CATALOG).find(
      (e) => e.slot === "weapon" && e.path === visual.path && e.weaponId === visual.weapon
    );
    const key = match?.nameKey ?? `weapon.${visual.weapon}`;
    return t(key, locale);
  }
  const entry = getGearEntry(gearId);
  return t(entry?.nameKey ?? gearId, locale);
}
