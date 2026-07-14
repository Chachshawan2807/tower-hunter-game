import type { WeaponCategoryId, ItemRarityVisual } from "./weaponTypes";

const WEAPON_IDS: readonly WeaponCategoryId[] = [
  "katana",
  "dual_swords",
  "staff",
  "greatsword",
  "greataxe",
  "spear",
  "wand",
  "bow",
  "dual_daggers",
];

const RARITIES: readonly ItemRarityVisual[] = [
  "common",
  "rare",
  "epic",
  "legendary",
];

export interface ItemWeaponVisual {
  weaponId: WeaponCategoryId;
  rarity: ItemRarityVisual;
}

/** Derives weapon icon + rarity from server item id strings */
export function resolveItemWeaponVisual(itemId: string): ItemWeaponVisual {
  const lower = itemId.toLowerCase();
  const rarity =
    RARITIES.find((r) => lower.endsWith(`.${r}`) || lower.includes(`.${r}.`)) ??
    "common";

  const matchedWeapon = WEAPON_IDS.find((w) => lower.includes(w.replace("_", "")));
  if (matchedWeapon) {
    return { weaponId: matchedWeapon, rarity };
  }

  const hash = [...itemId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return { weaponId: WEAPON_IDS[hash % WEAPON_IDS.length], rarity };
}
