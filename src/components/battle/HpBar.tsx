import { memo } from "react";

interface HpBarProps {
  label: string;
  hp: number;
  maxHp: number;
  percent: number;
  variant: "player" | "enemy";
}

export const HpBar = memo(function HpBar({
  label,
  hp,
  maxHp,
  percent,
  variant,
}: HpBarProps) {
  const isLow = percent > 0 && percent <= 25;
  const isCritical = percent > 0 && percent <= 10;

  return (
    <div className="hp-bar-wrap">
      <div className="hp-bar-label">
        <span>{label}</span>
        <span className="tabular-nums">
          {hp}/{maxHp}
        </span>
      </div>
      <div
        className={`hp-bar ${isLow ? "hp-bar--low" : ""} ${isCritical ? "hp-bar--critical" : ""}`}
        role="progressbar"
        aria-valuenow={hp}
        aria-valuemin={0}
        aria-valuemax={maxHp}
        aria-label={`${label} health`}
      >
        <div
          className={`hp-bar__fill ${variant === "enemy" ? "hp-bar__fill--enemy" : ""}`}
          style={{ width: `${percent}%` }}
        />
        <div className="hp-bar__track-glow" aria-hidden="true" />
      </div>
    </div>
  );
});
