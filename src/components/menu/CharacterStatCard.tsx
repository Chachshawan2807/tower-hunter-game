import { STATUS_POINT_COST, type StatusStatKey } from "../../engine/formulas/statusPoints";
import { t, type Locale } from "../../utils/i18n";
import type { StatRow } from "./characterStatRows";
import {
  CharacterStatAllocPicker,
  type StatusAllocAmount,
} from "./CharacterStatAllocPicker";

interface CharacterStatCardProps {
  stat: StatRow;
  canAllocate: boolean;
  allocBusy: ReadonlySet<StatusStatKey>;
  userId: string | null;
  locale: Locale;
  statusPoints: number;
  isPickerOpen: boolean;
  onTogglePicker: (stat: StatusStatKey) => void;
  onAllocate: (stat: StatusStatKey, amount: StatusAllocAmount) => void;
}

export function CharacterStatCard({
  stat,
  canAllocate,
  allocBusy,
  userId,
  locale,
  statusPoints,
  isPickerOpen,
  onTogglePicker,
  onAllocate,
}: CharacterStatCardProps) {
  const hasGearBonus = Boolean(stat.gearBonus);
  const allocatable = Boolean(stat.allocStat);
  const statKey = stat.allocStat;
  const isBusy = statKey !== undefined && allocBusy.has(statKey);

  return (
    <div
      className={[
        "stat-item",
        "stat-item--stacked",
        stat.vital ? "stat-item--vital" : "",
        allocatable ? "stat-item--allocatable" : "",
        allocatable && canAllocate ? "stat-item--alloc-ready" : "",
        isPickerOpen ? "stat-item--alloc-picker-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="stat-item__head">
        <span className="stat-item__label">{stat.key}</span>
        {allocatable && statKey && (
          <span className="stat-item__alloc-anchor">
            <button
              type="button"
              className={[
                "stat-item__alloc-btn",
                isPickerOpen ? "stat-item__alloc-btn--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={!canAllocate || !userId || isBusy}
              aria-label={t("char.allocate.open_picker", locale, { stat: stat.key })}
              aria-expanded={isPickerOpen}
              title={t("char.allocate.hint", locale, { cost: STATUS_POINT_COST })}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePicker(statKey);
              }}
            >
              <span className="stat-item__alloc-btn-icon" aria-hidden="true">
                {isBusy ? "…" : "+"}
              </span>
            </button>
            {isPickerOpen ? (
              <CharacterStatAllocPicker
                locale={locale}
                statLabel={stat.key}
                statusPoints={statusPoints}
                busy={isBusy}
                onPick={(amount) => onAllocate(statKey, amount)}
              />
            ) : null}
          </span>
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
