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
        "tower-floor-block",
        isPassed ? "tower-floor-block--passed" : "",
        isActive ? "tower-floor-block--active" : "",
        isLocked ? "tower-floor-block--locked" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      ref={onRegister}
      role="listitem"
      aria-label={`${localeLabel} ${floor}${isLocked ? ` (${lockedLabel})` : ""}`}
      aria-current={isActive ? "true" : undefined}
    >
      <div
        className={[
          "tower-floor-card",
          isMilestone ? "tower-floor-card--milestone" : "",
          isActive ? "tower-floor-card--active" : "",
          isLocked ? "tower-floor-card--locked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isLocked ? (
          <span className="tower-floor-card__chains-back" aria-hidden />
        ) : null}
      </div>
      <span
        className={[
          "tower-floor-block__num",
          "tabular-nums",
          isLocked ? "tower-floor-block__num--badged tower-floor-block__num--locked" : "",
          isPassed ? "tower-floor-block__num--passed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        {floor}
      </span>
    </div>
  );
});
