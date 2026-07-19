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
    for (let floor = TOWER_TOTAL_FLOORS; floor >= 1; floor -= 1) {
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
      <div className="tower-spire" role="list">
        {floors.map((floor) => (
          <TowerFloorBlock
            key={floor}
            floor={floor}
            currentFloor={currentFloor}
            localeLabel={floorLabel}
            onRegister={(el) => registerFloor(floor, el)}
          />
        ))}
      </div>
    </div>
  );
}
