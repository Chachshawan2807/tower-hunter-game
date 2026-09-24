import { STATUS_POINT_COST } from "../../engine/formulas/statusPoints";
import { t, type Locale } from "../../utils/i18n";

export const STATUS_ALLOC_AMOUNTS = [1, 5, 10] as const;
export type StatusAllocAmount = (typeof STATUS_ALLOC_AMOUNTS)[number];

interface CharacterStatAllocPickerProps {
  locale: Locale;
  statLabel: string;
  statusPoints: number;
  busy: boolean;
  onPick: (amount: StatusAllocAmount) => void;
}

export function CharacterStatAllocPicker({
  locale,
  statLabel,
  statusPoints,
  busy,
  onPick,
}: CharacterStatAllocPickerProps) {
  return (
    <div
      className="stat-alloc-picker-panel skill-equip-picker-panel"
      role="group"
      aria-label={t("char.allocate.picker_aria", locale, { stat: statLabel })}
    >
      <div className="stat-alloc-picker-panel__grid">
        {STATUS_ALLOC_AMOUNTS.map((amount) => {
          const cost = amount * STATUS_POINT_COST;
          const disabled = busy || statusPoints < cost;
          return (
            <button
              key={amount}
              type="button"
              className="stat-alloc-picker-panel__btn"
              disabled={disabled}
              aria-label={t("char.allocate.amount_aria", locale, {
                stat: statLabel,
                amount: String(amount),
              })}
              onClick={(e) => {
                e.stopPropagation();
                onPick(amount);
              }}
            >
              +{amount}
            </button>
          );
        })}
      </div>
    </div>
  );
}
