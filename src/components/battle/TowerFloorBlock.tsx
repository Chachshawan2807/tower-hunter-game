import { memo } from "react";

import { playUiClick } from "../../hooks/useGameAudio";

interface TowerFloorBlockProps {
  floor: number;
  maxUnlockedFloor: number;
  selectedFloor: number;
  localeLabel: string;
  lockedLabel: string;
  onSelectFloor?: (floor: number) => void;
  onRegister?: (el: HTMLDivElement | null) => void;
}

export function isTowerMilestoneFloor(floor: number): boolean {
  return floor > 0 && floor % 5 === 0;
}

export const TowerFloorBlock = memo(function TowerFloorBlock({
  floor,
  maxUnlockedFloor,
  selectedFloor,
  localeLabel,
  lockedLabel,
  onSelectFloor,
  onRegister,
}: TowerFloorBlockProps) {
  const isPassed = floor < maxUnlockedFloor;
  const isLocked = floor > maxUnlockedFloor;
  const isCurrent = !isLocked && floor === selectedFloor;
  const isMilestone = isTowerMilestoneFloor(floor);
  const selectable = !isLocked && onSelectFloor;

  const select = () => {
    if (isLocked || !onSelectFloor) return;
    playUiClick();
    onSelectFloor(floor);
  };

  return (
    <div
      className={[
        "tower-floor-block",
        isPassed && !isCurrent ? "tower-floor-block--passed" : "",
        isCurrent ? "tower-floor-block--active tower-floor-block--selected" : "",
        isLocked ? "tower-floor-block--locked" : "",
        selectable ? "tower-floor-block--selectable" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      ref={onRegister}
      role="listitem"
      aria-label={`${localeLabel} ${floor}${isLocked ? ` (${lockedLabel})` : ""}`}
      aria-current={isCurrent ? "true" : undefined}
    >
      <button
        type="button"
        className={[
          "tower-floor-card",
          isMilestone ? "tower-floor-card--milestone" : "",
          isCurrent ? "tower-floor-card--active tower-floor-card--selected" : "",
          isLocked ? "tower-floor-card--locked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={isLocked}
        onClick={select}
        aria-label={`${localeLabel} ${floor}`}
      >
        {isLocked ? (
          <span className="tower-floor-card__chains-back" aria-hidden />
        ) : null}
      </button>
      <span
        className={[
          "tower-floor-block__num",
          "tabular-nums",
          isLocked
            ? "tower-floor-block__num--badged tower-floor-block__num--locked"
            : "",
          isPassed && !isCurrent ? "tower-floor-block__num--passed" : "",
          isCurrent ? "tower-floor-block__num--selected" : "",
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
