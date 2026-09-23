import { memo } from "react";

interface TowerFloorBlockProps {
  floor: number;
  currentFloor: number;
  localeLabel: string;
  lockedLabel: string;
  onRegister?: (el: HTMLDivElement | null) => void;
}

export function isTowerMilestoneFloor(floor: number): boolean {
  return floor > 0 && floor % 5 === 0;
}

export const TowerFloorBlock = memo(function TowerFloorBlock({
  floor,
  currentFloor,
  localeLabel,
  lockedLabel,
  onRegister,
}: TowerFloorBlockProps) {
  const isActive = floor === currentFloor;
  const isPassed = floor < currentFloor;
  const isLocked = floor > currentFloor;
  const isMilestone = isTowerMilestoneFloor(floor);

  return (
    <div
      className={[
        "tower-floor-card",
        isMilestone ? "tower-floor-card--milestone" : "",
        isActive ? "tower-floor-card--active" : "",
        isPassed ? "tower-floor-card--passed" : "",
        isLocked ? "tower-floor-card--locked" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      ref={onRegister}
      role="listitem"
      aria-label={`${localeLabel} ${floor}${isLocked ? ` (${lockedLabel})` : ""}`}
      aria-current={isActive ? "true" : undefined}
    >
      {isLocked ? (
        <span className="tower-floor-card__chains-back" aria-hidden />
      ) : null}
      <span
        className={[
          "tower-floor-card__value",
          isLocked ? "tower-floor-card__value--locked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        <span className="tower-floor-card__num tabular-nums">{floor}</span>
      </span>
    </div>
  );
});
