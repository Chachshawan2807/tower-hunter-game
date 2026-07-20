import { getEquipmentShopAssetKey } from "./equipmentShopItems";

export type ShopItemCategory =
  | "weapon"
  | "helm"
  | "chest"
  | "gloves"
  | "cloak"
  | "boots";

export const SHOP_CATEGORY_ORDER: ShopItemCategory[] = [
  "weapon",
  "helm",
  "chest",
  "gloves",
  "cloak",
  "boots",
];

export const SHOP_CATEGORY_LABEL_KEY: Record<ShopItemCategory, string> = {
  weapon: "shop.category.weapon",
  helm: "shop.category.helm",
  chest: "shop.category.chest",
  gloves: "shop.category.gloves",
  cloak: "shop.category.cloak",
  boots: "shop.category.boots",
};

/** Weapon sub-type order within the weapon shop category */
const WEAPON_TYPE_ORDER = [
  "weapon-sword",
  "weapon-sword-cross",
  "shield",
  "weapon-axe",
  "weapon-axe-cross",
] as const;

function resolveWeaponTypePrefix(itemId: string): string {
  const assetKey = getEquipmentShopAssetKey(itemId);
  if (!assetKey) return "";
  return assetKey.replace(/-\d{2}$/, "");
}

function weaponTypeRank(itemId: string): number {
  const prefix = resolveWeaponTypePrefix(itemId);
  const index = WEAPON_TYPE_ORDER.indexOf(prefix as (typeof WEAPON_TYPE_ORDER)[number]);
  return index >= 0 ? index : WEAPON_TYPE_ORDER.length;
}

export function resolveShopItemCategory(itemId: string): ShopItemCategory {
  const assetKey = getEquipmentShopAssetKey(itemId);
  if (!assetKey) return "weapon";

  const prefix = assetKey.replace(/-\d{2}$/, "");
  if (prefix.startsWith("weapon-") || prefix === "shield") return "weapon";
  return prefix as ShopItemCategory;
}

export interface ShopCatalogGroup<T extends { id: string; cost: string }> {
  category: ShopItemCategory;
  labelKey: string;
  items: T[];
}

function compareByPriceAsc<T extends { id: string; cost: string }>(a: T, b: T): number {
  const costA = BigInt(a.cost);
  const costB = BigInt(b.cost);
  if (costA < costB) return -1;
  if (costA > costB) return 1;
  return a.id.localeCompare(b.id);
}

function compareWeaponItems<T extends { id: string; cost: string }>(a: T, b: T): number {
  const typeDiff = weaponTypeRank(a.id) - weaponTypeRank(b.id);
  if (typeDiff !== 0) return typeDiff;
  return compareByPriceAsc(a, b);
}

function sortCategoryItems<T extends { id: string; cost: string }>(
  category: ShopItemCategory,
  items: T[]
): T[] {
  if (category === "weapon") {
    return [...items].sort(compareWeaponItems);
  }
  return [...items].sort(compareByPriceAsc);
}

export function groupShopCatalogByCategory<T extends { id: string; cost: string }>(
  items: T[]
): ShopCatalogGroup<T>[] {
  const buckets = new Map<ShopItemCategory, T[]>();

  for (const item of items) {
    const category = resolveShopItemCategory(item.id);
    const bucket = buckets.get(category) ?? [];
    bucket.push(item);
    buckets.set(category, bucket);
  }

  return SHOP_CATEGORY_ORDER.filter((category) => buckets.has(category)).map((category) => ({
    category,
    labelKey: SHOP_CATEGORY_LABEL_KEY[category],
    items: sortCategoryItems(category, buckets.get(category) ?? []),
  }));
}
