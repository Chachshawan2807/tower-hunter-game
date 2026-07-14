import type { ItemRarity } from "../db/types";

export interface ShopCatalogItem {
  id: string;
  stringId: string;
  cost: bigint;
  rarity: ItemRarity;
  icon: string;
}

export const SHOP_CATALOG: ShopCatalogItem[] = [
  {
    id: "shop_hp_potion",
    stringId: "shop.item.hp_potion",
    cost: 25n,
    rarity: "common",
    icon: "🧪",
  },
  {
    id: "shop_mp_potion",
    stringId: "shop.item.mp_potion",
    cost: 25n,
    rarity: "common",
    icon: "💧",
  },
  {
    id: "shop_atk_scroll",
    stringId: "shop.item.atk_scroll",
    cost: 100n,
    rarity: "rare",
    icon: "📜",
  },
  {
    id: "shop_def_charm",
    stringId: "shop.item.def_charm",
    cost: 100n,
    rarity: "rare",
    icon: "🔮",
  },
  {
    id: "shop_lucky_coin",
    stringId: "shop.item.lucky_coin",
    cost: 500n,
    rarity: "epic",
    icon: "🪙",
  },
];

export function findShopItem(itemId: string): ShopCatalogItem | undefined {
  return SHOP_CATALOG.find((item) => item.id === itemId);
}
