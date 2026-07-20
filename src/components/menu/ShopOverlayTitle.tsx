import { GameIcon } from "../ui/icons";
import { t, type Locale } from "../../utils/i18n";

interface ShopOverlayTitleProps {
  locale: Locale;
  gold: string;
}

export function ShopOverlayTitle({ locale, gold }: ShopOverlayTitleProps) {
  return (
    <span className="shop-overlay-title">
      <span className="shop-overlay-title__label">{t("nav.shop", locale)}</span>
      <span className="shop-overlay-title__sep" aria-hidden="true">
        ·
      </span>
      <span className="shop-overlay-title__balance tabular-nums">
        <GameIcon name="gold" size={23} className="shop-overlay-title__gold" />
        {gold}
      </span>
    </span>
  );
}

export function shopOverlayTitleLabel(locale: Locale, gold: string): string {
  return `${t("nav.shop", locale)} ${gold}`;
}
