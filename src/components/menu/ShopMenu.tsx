import { useCallback, useEffect, useMemo, useState } from "react";
import {
  groupShopCatalogByCategory,
  type ShopItemCategory,
} from "../../engine/shop/shopCatalogLayout";
import { getEquipmentShopLabel } from "../../engine/shop/equipmentShopItems";
import { queueMutationIfOffline } from "../../client/offline/queueMutation";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { api, type ShopCatalogItem } from "../../utils/api";
import { createActionIdempotencyKey } from "../../utils/idempotencyKey";
import { formatDialogMessage } from "../../utils/formatDialogMessage";
import { formatGoldAmount } from "../../utils/formatGold";
import { t, type Locale } from "../../utils/i18n";
import { GameIcon } from "../ui/icons";
import { ShopCategorySection } from "./ShopCategorySection";
import { ShopItemIcon } from "./ShopItemIcon";

export interface ShopPurchaseResult {
  balanceAfter: string;
  inventoryOutcome: string;
}

interface ShopMenuProps {
  locale: Locale;
  userId: string | null;
  gold: string;
  onGoldChange: (balance: string) => void;
  onPurchase: (result: ShopPurchaseResult) => void;
  onPurchaseError?: () => void;
}

function resolveShopItemName(item: ShopCatalogItem, locale: Locale): string {
  const equipLabel = getEquipmentShopLabel(item.id, locale);
  if (equipLabel) return equipLabel;
  return t(item.stringId, locale);
}

export function ShopMenu({
  locale,
  userId,
  gold,
  onGoldChange,
  onPurchase,
  onPurchaseError,
}: ShopMenuProps) {
  const [catalog, setCatalog] = useState<ShopCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<ShopItemCategory>>(
    () => new Set()
  );
  const [pendingBuy, setPendingBuy] = useState<ShopCatalogItem | null>(null);

  useDismissOnOutside(
    expandedCategories.size > 0 && !pendingBuy,
    () => setExpandedCategories(new Set()),
    [".shop-section"]
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

  const executeBuy = async (item: ShopCatalogItem) => {
    if (!userId || busyId) return;
    const cost = BigInt(item.cost);
    if (goldBalance < cost) return;

    const previousGold = gold;
    onGoldChange((goldBalance - cost).toString());

    setBusyId(item.id);
    setMessage(null);
    const idempotencyKey = createActionIdempotencyKey(
      "shop_purchase",
      userId,
      item.id
    );
    try {
      const result = await api.purchaseShopItem(userId, item.id, idempotencyKey);
      onGoldChange(result.balanceAfter);
      setMessage(
        result.inventoryOutcome === "mailbox"
          ? t("shop.purchased_mailbox", locale)
          : t("shop.purchased", locale)
      );
      onPurchase(result);
    } catch (err) {
      const queued = await queueMutationIfOffline(
        "shop_purchase",
        userId,
        idempotencyKey,
        { itemId: item.id },
        err
      );
      if (queued) {
        setMessage(t("common.offline_queued", locale));
        return;
      }
      onGoldChange(previousGold);
      onPurchaseError?.();
      setMessage(t("shop.error", locale));
    } finally {
      setBusyId(null);
    }
  };

  const confirmBuy = async () => {
    if (!pendingBuy) return;
    const item = pendingBuy;
    setPendingBuy(null);
    await executeBuy(item);
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
                      disabled={!userId || busyId === item.id || !canAfford}
                      aria-label={`${t("shop.buy", locale)} ${name} ${formatGoldAmount(item.cost)}`}
                      onClick={() => setPendingBuy(item)}
                    >
                      <GameIcon name="gold" size={18} className="shop-item__buy-icon" />
                      {formatGoldAmount(item.cost)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </ShopCategorySection>
        ))}
      </div>

      {pendingBuy && (
        <ConfirmDialog
          locale={locale}
          title={t("shop.confirm_buy_title", locale)}
          message={formatDialogMessage("shop.confirm_buy_message", locale, {
            item: resolveShopItemName(pendingBuy, locale),
            cost: formatGoldAmount(pendingBuy.cost),
          })}
          confirmLabel={t("shop.buy", locale)}
          busy={busyId === pendingBuy.id}
          onConfirm={() => void confirmBuy()}
          onCancel={() => setPendingBuy(null)}
        />
      )}
    </div>
  );
}
