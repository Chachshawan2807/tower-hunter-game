import { useCallback, useEffect, useState } from "react";
import { t, type Locale } from "../../utils/i18n";
import { api, type ShopCatalogItem } from "../../utils/api";
import { CharacterFigure } from "../character/CharacterFigure";
import { GameIcon, shopIconName } from "../ui/icons";

interface ShopMenuProps {
  locale: Locale;
  userId: string | null;
  gold: string;
  onPurchase?: () => void;
}

export function ShopMenu({
  locale,
  userId,
  gold,
  onPurchase,
}: ShopMenuProps) {
  const [catalog, setCatalog] = useState<ShopCatalogItem[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getShopCatalog().then((res) => setCatalog(res.items));
  }, []);

  const handleBuy = useCallback(
    async (itemId: string) => {
      if (!userId || busy) return;

      setBusy(itemId);
      setMessage(null);

      try {
        const result = await api.purchaseShopItem(
          userId,
          itemId,
          `shop:${userId}:${itemId}:${Date.now()}`
        );
        setMessage(
          `${t("shop.purchased", locale)} — ${result.goldSpent}`
        );
        onPurchase?.();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : t("shop.error", locale));
      } finally {
        setBusy(null);
      }
    },
    [userId, busy, locale, onPurchase]
  );

  const goldBalance = BigInt(gold || "0");

  return (
    <div className="shop-menu">
      <div className="shop-merchant">
        <CharacterFigure
          side="npc"
          archetype="merchant"
          animState="idle"
          size="npc"
          label={t("shop.title", locale)}
        />
        <span className="shop-merchant__label">{t("shop.title", locale)}</span>
      </div>

      <p className="shop-balance ui-balance">
        <GameIcon name="gold" size={18} />
        {t("shop.balance", locale)}: {gold}
      </p>

      {message && (
        <p className="shop-message">
          <GameIcon name="gold" size={16} />
          {message}
        </p>
      )}

      <ul className="shop-list">
        {catalog.map((item) => {
          const cost = BigInt(item.cost);
          const canAfford = goldBalance >= cost;

          return (
            <li key={item.id} className="shop-item ui-row">
              <span className="shop-item__icon ui-row__icon">
                <GameIcon name={shopIconName(item.id)} size={28} />
              </span>
              <div className="shop-item__info ui-row__main">
                <span className="shop-item__name">
                  {t(item.stringId, locale)}
                </span>
                <span className="shop-item__cost">
                  <GameIcon name="gold" size={14} />
                  {item.cost}
                </span>
              </div>
              <div className="ui-row__action">
                <button
                  className="shop-item__buy"
                  disabled={!userId || !canAfford || busy === item.id}
                  onClick={() => handleBuy(item.id)}
                >
                  {busy === item.id ? "..." : t("shop.buy", locale)}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
