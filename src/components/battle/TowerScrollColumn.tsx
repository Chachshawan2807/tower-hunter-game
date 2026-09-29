import { useMemo } from "react";
import { useTowerFloorScroll } from "../../hooks/useTowerFloorScroll";
import { t, type Locale } from "../../utils/i18n";
import { TowerFloorBlock } from "./TowerFloorBlock";
import { TOWER_TOTAL_FLOORS } from "./towerFloorScale";

interface TowerScrollColumnProps {
  locale: Locale;
  maxUnlockedFloor: number;
  selectedFloor: number;
  onSelectFloor: (floor: number) => void;
  floorLabel: string;
  scrollGeneration?: number;
}

export function TowerScrollColumn({
  locale,
  maxUnlockedFloor,
  selectedFloor,
  onSelectFloor,
  floorLabel,
  scrollGeneration = 0,
}: TowerScrollColumnProps) {
  const { scrollRef, registerFloor } = useTowerFloorScroll(
    selectedFloor,
    scrollGeneration
  );

  const floors = useMemo(() => {
    const list: number[] = [];
    for (let floor = 1; floor <= TOWER_TOTAL_FLOORS; floor += 1) {
      list.push(floor);
    }
    return list;
  }, []);

  return (
    <div
      className="tower-scroll"
      ref={scrollRef}
      role="region"
      aria-label={t("tower.floors", locale)}
    >
      <ul className="tower-floor-grid" role="list">
        {floors.map((floor) => (
          <li key={floor} className="tower-floor-grid__cell">
            <TowerFloorBlock
              floor={floor}
              maxUnlockedFloor={maxUnlockedFloor}
              selectedFloor={selectedFloor}
              localeLabel={floorLabel}
              lockedLabel={t("tower.locked", locale)}
              onSelectFloor={onSelectFloor}
              onRegister={(el) => registerFloor(floor, el)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
