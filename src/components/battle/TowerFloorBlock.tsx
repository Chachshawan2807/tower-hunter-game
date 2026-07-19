import { memo, type CSSProperties } from "react";
import { GameIcon } from "../ui/icons";
import { towerTierWidthPercent } from "./towerFloorScale";

interface TowerFloorBlockProps {
  floor: number;
  currentFloor: number;
  localeLabel: string;
  onRegister?: (el: HTMLDivElement | null) => void;
}

export function isTowerMilestoneFloor(floor: number): boolean {
  return floor > 0 && floor % 5 === 0;
}

export const TowerFloorBlock = memo(function TowerFloorBlock({
  floor,
  currentFloor,
  localeLabel,
  onRegister,
}: TowerFloorBlockProps) {
  const isActive = floor === currentFloor;
  const isPassed = floor < currentFloor;
  const isLocked = floor > currentFloor;
  const isMilestone = isTowerMilestoneFloor(floor);
  const tierWidth = towerTierWidthPercent(floor);

  return (
    <div
      className={[
        "tower-floor-tier",
        isMilestone ? "tower-floor-tier--milestone" : "",
        isActive ? "tower-floor-tier--active" : "",
        isPassed ? "tower-floor-tier--passed" : "",
        isLocked ? "tower-floor-tier--locked" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--tier-scale": `${tierWidth}%` } as CSSProperties}
      ref={onRegister}
      role="listitem"
      aria-label={`${localeLabel} ${floor}${isLocked ? " (locked)" : ""}`}
      aria-current={isActive ? "true" : undefined}
    >
      <div className="tower-floor-tier__face">
        {isLocked ? (
          <span className="tower-floor-tier__lock" aria-hidden>
            <GameIcon name="lock" size={17} className="tower-floor-tier__lock-icon" />
          </span>
        ) : null}
        <span className="tower-floor-tier__num tabular-nums">{floor}</span>
      </div>
    </div>
  );
});
