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
    items: [...(buckets.get(category) ?? [])].sort(compareByPriceAsc),
  }));
}
