import { useCallback, useEffect, useMemo, useState } from "react";
import {
  groupShopCatalogByCategory,
  type ShopItemCategory,
} from "../../engine/shop/shopCatalogLayout";
import { getEquipmentShopLabel } from "../../engine/shop/equipmentShopItems";
import { api, type ShopCatalogItem } from "../../utils/api";
import { t, type Locale } from "../../utils/i18n";
import { GameIcon } from "../ui/icons";
import { ShopCategorySection } from "./ShopCategorySection";
import { ShopItemIcon } from "./ShopItemIcon";

interface ShopMenuProps {
  locale: Locale;
  userId: string | null;
  gold: string;
  onPurchase: () => void;
}

function resolveShopItemName(item: ShopCatalogItem, locale: Locale): string {
  const equipLabel = getEquipmentShopLabel(item.id, locale);
  if (equipLabel) return equipLabel;
  return t(item.stringId, locale);
}

export function ShopMenu({ locale, userId, gold, onPurchase }: ShopMenuProps) {
  const [catalog, setCatalog] = useState<ShopCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<ShopItemCategory>>(
    () => new Set()
  );

  const goldBalance = BigInt(gold || "0");
  const catalogGroups = useMemo(() => groupShopCatalogByCategory(catalog), [catalog]);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const { items } = await api.getShopCatalog();
      setCatalog(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const toggleCategory = (category: ShopItemCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleBuy = async (item: ShopCatalogItem) => {
    if (!userId || busyId) return;
    const cost = BigInt(item.cost);
    if (goldBalance < cost) return;

    setBusyId(item.id);
    setMessage(null);
    try {
      await api.purchaseShopItem(userId, item.id, crypto.randomUUID());
      setMessage(t("shop.purchased", locale));
      onPurchase();
    } catch {
      setMessage(t("shop.error", locale));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className="menu-empty">...</p>;
  }

  return (
    <div className="shop-menu">
      {message && (
        <p className="shop-message" role="status">
          {message}
        </p>
      )}

      <div className="shop-sections">
        {catalogGroups.map((group) => (
          <ShopCategorySection
            key={group.category}
            category={group.category}
            labelKey={group.labelKey}
            itemCount={group.items.length}
            locale={locale}
            expanded={expandedCategories.has(group.category)}
            onToggle={() => toggleCategory(group.category)}
          >
            <ul className="shop-grid" role="list">
              {group.items.map((item) => {
                const cost = BigInt(item.cost);
                const canAfford = goldBalance >= cost;
                const name = resolveShopItemName(item, locale);

                return (
                  <li key={item.id} className="shop-item">
                    <div className="shop-item__art">
                      <ShopItemIcon itemId={item.id} icon={item.icon} size={34} />
                    </div>
                    <p className="shop-item__name">{name}</p>
                    <ul
                      className="shop-item__stats"
                      aria-label={t("char.stats", locale)}
                    >
                      {item.statPreview.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="shop-item__buy tabular-nums"
                      disabled={!userId || busyId !== null || !canAfford}
                      aria-label={`${t("shop.buy", locale)} ${name} ${item.cost}`}
                      onClick={() => void handleBuy(item)}
                    >
                      <GameIcon name="gold" size={18} className="shop-item__buy-icon" />
                      {item.cost}
                    </button>
                  </li>
                );
              })}
            </ul>
          </ShopCategorySection>
        ))}
      </div>
    </div>
  );
}
