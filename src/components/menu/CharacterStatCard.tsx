import { STATUS_POINT_COST, type StatusStatKey } from "../../engine/formulas/statusPoints";
import { t, type Locale } from "../../utils/i18n";
import type { StatRow } from "./characterStatRows";

interface CharacterStatCardProps {
  stat: StatRow;
  canAllocate: boolean;
  allocBusy: StatusStatKey | null;
  userId: string | null;
  locale: Locale;
  onAllocate: (stat: StatusStatKey) => void;
}

export function CharacterStatCard({
  stat,
  canAllocate,
  allocBusy,
  userId,
  locale,
  onAllocate,
}: CharacterStatCardProps) {
  const hasGearBonus = Boolean(stat.gearBonus);
  const allocatable = Boolean(stat.allocStat);

  return (
    <div
      className={[
        "stat-item",
        "stat-item--stacked",
        stat.vital ? "stat-item--vital" : "",
        allocatable ? "stat-item--allocatable" : "",
        allocatable && canAllocate ? "stat-item--alloc-ready" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="stat-item__head">
        <span className="stat-item__label">{stat.key}</span>
        {allocatable && (
          <button
            type="button"
            className="stat-item__alloc-btn"
            disabled={!canAllocate || !userId}
            aria-label={t("char.allocate.aria", locale, { stat: stat.key })}
            title={t("char.allocate.hint", locale, { cost: STATUS_POINT_COST })}
            onClick={() => onAllocate(stat.allocStat!)}
          >
            <span className="stat-item__alloc-btn-icon" aria-hidden="true">
              {allocBusy === stat.allocStat ? "…" : "+"}
            </span>
          </button>
        )}
      </div>

      <div className="stat-item__base tabular-nums">{stat.baseValue}</div>

      <div
        className={`stat-item__gear tabular-nums${hasGearBonus ? "" : " stat-item__gear--empty"}`}
        aria-label={t("char.stat_gear_bonus", locale)}
      >
        {stat.gearBonus ?? "—"}
      </div>
    </div>
  );
}
