import { t, type Locale } from "../../utils/i18n";

interface ShopMenuProps {
  locale: Locale;
}

export function ShopMenu({ locale }: ShopMenuProps) {
  return (
    <p style={{ color: "var(--text-dim)", textAlign: "center", padding: "24px 0" }}>
      🏪 {t("shop.soon", locale)}
    </p>
  );
}
