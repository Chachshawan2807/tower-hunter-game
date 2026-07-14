import { t, type Locale } from "../../utils/i18n";

export type NavTab = "character" | "skills" | "tower" | "bag" | "shop";

interface BottomNavProps {
  locale: Locale;
  active: NavTab;
  onSelect: (tab: NavTab) => void;
}

const NAV_ITEMS: Array<{ id: NavTab; icon: string; labelKey: string }> = [
  { id: "character", icon: "🧙", labelKey: "nav.character" },
  { id: "skills", icon: "✨", labelKey: "nav.skills" },
  { id: "tower", icon: "🗼", labelKey: "nav.tower" },
  { id: "bag", icon: "🎒", labelKey: "nav.bag" },
  { id: "shop", icon: "🏪", labelKey: "nav.shop" },
];

export function BottomNav({ locale, active, onSelect }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-btn ${item.id === "tower" ? "nav-btn--tower" : ""} ${
            active === item.id ? "nav-btn--active" : ""
          }`}
          onClick={() => onSelect(item.id)}
          aria-label={t(item.labelKey, locale)}
        >
          <span className="nav-btn__icon">{item.icon}</span>
          <span className="nav-btn__label nav-btn__label--desktop">
            {t(item.labelKey, locale)}
          </span>
        </button>
      ))}
    </nav>
  );
}
