import { getEquipmentShopLabel } from "../engine/shop/equipmentShopItems";

import { GEAR_CATALOG, getGearEntry } from "../engine/art/equipment/catalog";

import { resolveEquippableItem } from "../engine/art/equipment/itemMapping";

import type { SkillPath } from "../engine/types";

import { t, type Locale } from "./i18n";



export function resolveItemLabel(

  itemId: string,

  locale: Locale,

  skillPath: SkillPath

): string {

  const equipShopLabel = getEquipmentShopLabel(itemId, locale);

  if (equipShopLabel) return equipShopLabel;



  if (GEAR_CATALOG[itemId]) {

    return t(GEAR_CATALOG[itemId].nameKey, locale);

  }



  const equippable = resolveEquippableItem(itemId, skillPath);

  if (equippable) {

    const entry = getGearEntry(equippable.gearId);

    if (entry?.nameKey) return t(entry.nameKey, locale);

  }



  return itemId;

}



export function abbreviateItemLabel(name: string, maxLen = 7): string {

  const trimmed = name.trim();

  if (trimmed.length <= maxLen) return trimmed;

  return `${trimmed.slice(0, maxLen)}…`;

}

