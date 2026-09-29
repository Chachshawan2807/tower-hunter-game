import { t, type Locale } from "../../utils/i18n";

interface BattleFloorBadgeProps {
  locale: Locale;
  floor: number;
  variant?: "overlay-row" | "stage";
}

export function BattleFloorBadge({
  locale,
  floor,
  variant = "overlay-row",
}: BattleFloorBadgeProps) {
  const label = t("tower.floor", locale);

  return (
    <p
      className={
        variant === "overlay-row"
          ? "battle-entities__floor-num tabular-nums"
          : "battle-arena__floor-badge tabular-nums"
      }
      aria-label={`${label} ${floor}`}
    >
      {floor}
    </p>
  );
}
