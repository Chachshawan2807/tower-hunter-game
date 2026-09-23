import { useMemo } from "react";
import { useTowerFloorScroll } from "../../hooks/useTowerFloorScroll";
import { t, type Locale } from "../../utils/i18n";
import { TowerFloorBlock } from "./TowerFloorBlock";
import { TOWER_TOTAL_FLOORS } from "./towerFloorScale";

interface TowerScrollColumnProps {
  locale: Locale;
  currentFloor: number;
  floorLabel: string;
}

export function TowerScrollColumn({
  locale,
  currentFloor,
  floorLabel,
}: TowerScrollColumnProps) {
  const { scrollRef, registerFloor } = useTowerFloorScroll(currentFloor);

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
              currentFloor={currentFloor}
              localeLabel={floorLabel}
              lockedLabel={t("tower.locked", locale)}
              onRegister={(el) => registerFloor(floor, el)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
