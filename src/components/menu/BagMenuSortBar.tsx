import {
  BAG_MENU_SORT_MODES,
  type BagMenuSortMode,
} from "../../engine/inventory/bagMenuSort";
import { t, type Locale } from "../../utils/i18n";

const SORT_LABEL_KEY: Record<BagMenuSortMode, string> = {
  recent_acquired: "bag.sort.recent_acquired",
  recent_equipped: "bag.sort.recent_equipped",
  category: "bag.sort.category",
};

interface BagMenuSortBarProps {
  locale: Locale;
  sortMode: BagMenuSortMode;
  onSortModeChange: (mode: BagMenuSortMode) => void;
}

export function BagMenuSortBar({
  locale,
  sortMode,
  onSortModeChange,
}: BagMenuSortBarProps) {
  return (
    <div
      className="skill-menu__filters"
      role="group"
      aria-label={t("bag.sort.group_label", locale)}
    >
      {BAG_MENU_SORT_MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          className={
            sortMode === mode
              ? "skill-filter-btn skill-filter-btn--active"
              : "skill-filter-btn"
          }
          aria-pressed={sortMode === mode}
          onClick={() => onSortModeChange(mode)}
        >
          {t(SORT_LABEL_KEY[mode], locale)}
        </button>
      ))}
    </div>
  );
}
