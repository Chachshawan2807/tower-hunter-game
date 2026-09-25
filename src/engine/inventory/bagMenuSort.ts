import {
  resolveShopItemCategory,
  SHOP_CATEGORY_ORDER,
} from "../shop/shopCatalogLayout";

export type BagMenuSortMode = "recent_acquired" | "recent_equipped" | "category";

export const BAG_MENU_SORT_MODES: BagMenuSortMode[] = [
  "recent_acquired",
  "recent_equipped",
  "category",
];

export interface BagMenuSortableRow {
  id: string;
  item_id: string;
  updated_at: string;
  last_equipped_at: string | null;
}

const categoryRank = new Map(
  SHOP_CATEGORY_ORDER.map((category, index) => [category, index])
);

function categoryIndex(itemId: string): number {
  return categoryRank.get(resolveShopItemCategory(itemId)) ?? SHOP_CATEGORY_ORDER.length;
}

function tieBreak(a: BagMenuSortableRow, b: BagMenuSortableRow): number {
  const byItemId = a.item_id.localeCompare(b.item_id);
  if (byItemId !== 0) return byItemId;
  return a.id.localeCompare(b.id);
}

function sortByMode<T extends BagMenuSortableRow>(
  items: T[],
  mode: BagMenuSortMode
): T[] {
  const sorted = [...items];

  if (mode === "recent_acquired") {
    sorted.sort((a, b) => {
      const diff = Date.parse(b.updated_at) - Date.parse(a.updated_at);
      return diff !== 0 ? diff : tieBreak(a, b);
    });
    return sorted;
  }

  if (mode === "recent_equipped") {
    sorted.sort((a, b) => {
      const equippedA = a.last_equipped_at ? Date.parse(a.last_equipped_at) : 0;
      const equippedB = b.last_equipped_at ? Date.parse(b.last_equipped_at) : 0;
      if (equippedB !== equippedA) return equippedB - equippedA;
      return tieBreak(a, b);
    });
    return sorted;
  }

  sorted.sort((a, b) => {
    const diff = categoryIndex(a.item_id) - categoryIndex(b.item_id);
    return diff !== 0 ? diff : tieBreak(a, b);
  });
  return sorted;
}

export function sortBagMenuInventory<T extends BagMenuSortableRow>(
  items: T[],
  mode: BagMenuSortMode,
  equippedGearIds?: ReadonlySet<string>
): T[] {
  if (!equippedGearIds || equippedGearIds.size === 0) {
    return sortByMode(items, mode);
  }

  const equipped: T[] = [];
  const rest: T[] = [];
  for (const row of items) {
    if (equippedGearIds.has(row.item_id)) {
      equipped.push(row);
    } else {
      rest.push(row);
    }
  }

  return [...sortByMode(equipped, mode), ...sortByMode(rest, mode)];
}
