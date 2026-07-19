import { GEAR_CATALOG, getGearEntry } from "../engine/art/equipment/catalog";
import { resolveEquippableItem } from "../engine/art/equipment/itemMapping";
import type { SkillPath } from "../engine/types";
import { t, type Locale } from "./i18n";

const SHOP_ITEM_KEYS: Record<string, string> = {
  hp_potion: "shop.item.hp_potion",
  mp_potion: "shop.item.mp_potion",
  atk_scroll: "shop.item.atk_scroll",
  def_charm: "shop.item.def_charm",
  lucky_coin: "shop.item.lucky_coin",
};

export function resolveItemLabel(
  itemId: string,
  locale: Locale,
  skillPath: SkillPath
): string {
  if (GEAR_CATALOG[itemId]) {
    return t(GEAR_CATALOG[itemId].nameKey, locale);
  }

  const equippable = resolveEquippableItem(itemId, skillPath);
  if (equippable) {
    const entry = getGearEntry(equippable.gearId);
    if (entry?.nameKey) return t(entry.nameKey, locale);
  }

  const shopSuffix = itemId.replace(/^shop[._]?/i, "");
  const shopKey = SHOP_ITEM_KEYS[shopSuffix];
  if (shopKey) return t(shopKey, locale);

  return itemId;
}

export function abbreviateItemLabel(name: string, maxLen = 7): string {
  const trimmed = name.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen)}…`;
}
