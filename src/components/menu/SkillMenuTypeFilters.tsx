import type { SkillType } from "../../engine/skills/skillTypes";
import { t, type Locale } from "../../utils/i18n";
import { TYPE_FILTERS } from "./skillMenuConstants";

interface SkillMenuTypeFiltersProps {
  locale: Locale;
  typeFilter: SkillType | "all";
  onTypeFilterChange: (filter: SkillType | "all") => void;
}

export function SkillMenuTypeFilters({
  locale,
  typeFilter,
  onTypeFilterChange,
}: SkillMenuTypeFiltersProps) {
  return (
    <div className="skill-menu__filters">
      {TYPE_FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          className={
            typeFilter === filter
              ? "skill-filter-btn skill-filter-btn--active"
              : "skill-filter-btn"
          }
          onClick={() => onTypeFilterChange(filter)}
        >
          {filter === "all" ? t("skills.filter.all", locale) : filter}
        </button>
      ))}
    </div>
  );
}
