import type { ReactNode } from "react";
import type { ShopItemCategory } from "../../engine/shop/shopCatalogLayout";
import { DisclosurePanel } from "../ui/DisclosurePanel";
import { t, type Locale } from "../../utils/i18n";

interface ShopCategorySectionProps {
  category: ShopItemCategory;
  labelKey: string;
  itemCount: number;
  locale: Locale;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function ShopCategorySection({
  category,
  labelKey,
  itemCount,
  locale,
  expanded,
  onToggle,
  children,
}: ShopCategorySectionProps) {
  const panelId = `shop-panel-${category}`;
  const titleId = `shop-cat-${category}`;

  return (
    <section
      className={`shop-section${expanded ? "" : " shop-section--collapsed"}`}
      aria-labelledby={titleId}
    >
      <button
        type="button"
        id={titleId}
        className="shop-section__toggle"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="shop-section__toggle-label">{t(labelKey, locale)}</span>
        <span className="shop-section__toggle-meta tabular-nums" aria-hidden>
          {itemCount}
        </span>
        <span className="shop-section__chevron" aria-hidden />
      </button>

      <DisclosurePanel
        id={panelId}
        expanded={expanded}
        className="shop-section__panel"
      >
        {children}
      </DisclosurePanel>
    </section>
  );
}
