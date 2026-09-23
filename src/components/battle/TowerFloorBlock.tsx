import { memo } from "react";
import { GameIcon } from "../ui/icons";

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
      <span className="tower-floor-card__icon" aria-hidden>
        {isLocked ? (
          <GameIcon name="lock" size={22} className="tower-floor-card__lock-icon" />
        ) : (
          <span className="tower-floor-card__num tabular-nums">{floor}</span>
        )}
      </span>
      <span className="tower-floor-card__meta">
        <span className="tower-floor-card__label tabular-nums">{floor}</span>
      </span>
    </div>
  );
});
