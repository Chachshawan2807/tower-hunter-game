import { forwardRef } from "react";
import { GameIcon, type GameIconName } from "../ui/icons";
import { t, type Locale } from "../../utils/i18n";
import { playUiClick } from "../../hooks/useGameAudio";

export type NavTab = "character" | "skills" | "tower" | "bag" | "shop";

interface BottomNavProps {
  locale: Locale;
  active: NavTab | null;
  /** Block interaction while a centered dialog is open */
  blocked?: boolean;
  onSelect: (tab: NavTab) => void;
}

const NAV_ITEMS: Array<{ id: NavTab; icon: GameIconName; labelKey: string }> = [
  { id: "character", icon: "character", labelKey: "nav.character" },
  { id: "skills", icon: "book", labelKey: "nav.skills" },
  { id: "tower", icon: "tower", labelKey: "nav.tower" },
  { id: "bag", icon: "bag", labelKey: "nav.bag" },
  { id: "shop", icon: "shop", labelKey: "nav.shop" },
];

export const BottomNav = forwardRef<HTMLElement, BottomNavProps>(function BottomNav(
  { locale, active, blocked = false, onSelect },
  ref
) {
  return (
    <nav
      ref={ref}
      className={`bottom-nav${blocked ? " bottom-nav--blocked" : ""}`}
      aria-label="Main navigation"
      aria-hidden={blocked || undefined}
    >
      <div role="tablist" aria-label="Game sections" className="bottom-nav__dock">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const isTower = item.id === "tower";

          return (
            <button
              key={item.id}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
              disabled={blocked}
              className={`nav-btn ${isTower ? "nav-btn--tower" : ""} ${
                isActive ? "nav-btn--active" : ""
              }`}
              onClick={() => {
                playUiClick();
                onSelect(item.id);
              }}
              aria-label={t(item.labelKey, locale)}
            >
              {isTower ? (
                <span className="nav-btn__icon-wrap" aria-hidden="true">
                  <GameIcon name={item.icon} size={36} />
                </span>
              ) : (
                <span className="nav-btn__icon" aria-hidden="true">
                  <GameIcon name={item.icon} size={32} />
                </span>
              )}
              <span className="nav-btn__label">{t(item.labelKey, locale)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
