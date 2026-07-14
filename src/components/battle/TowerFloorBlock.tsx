import { memo } from "react";
import { getTowerZone } from "../../engine/art";

interface TowerFloorBlockProps {
  floor: number;
  currentFloor: number;
  localeLabel: string;
}

export const TowerFloorBlock = memo(function TowerFloorBlock({
  floor,
  currentFloor,
  localeLabel,
}: TowerFloorBlockProps) {
  const isActive = floor === currentFloor;
  const isBoss = floor % 10 === 0;
  const isPassed = floor < currentFloor;
  const zone = getTowerZone(floor);

  return (
    <div
      className={[
        "tower-floor-block",
        `tower-floor-block--zone-${zone.id}`,
        isActive ? "tower-floor-block--active" : "",
        isBoss ? "tower-floor-block--boss" : "",
        isPassed ? "tower-floor-block--passed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      title={`${localeLabel} ${floor}`}
      aria-hidden="true"
    />
  );
});
