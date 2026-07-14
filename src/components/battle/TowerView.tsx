import { t, type Locale } from "../../utils/i18n";
import { BattleArena } from "./BattleArena";
import type { useBattle } from "../../hooks/useBattle";

interface TowerViewProps {
  locale: Locale;
  currentFloor: number;
  battle: ReturnType<typeof useBattle>;
}

export function TowerView({ locale, currentFloor, battle }: TowerViewProps) {
  const inBattle = battle.events.length > 0 || battle.busy;

  return (
    <div className="tower-view">
      <div className="tower-graphic">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`tower-floor-block ${
              i === 0 ? "tower-floor-block--active" : ""
            }`}
          />
        ))}
      </div>

      <span className="tower-floor-label">
        {t("tower.floor", locale)} {currentFloor}
      </span>

      {inBattle ? (
        <BattleArena
          locale={locale}
          events={battle.events}
          actionRequired={battle.actionRequired}
          isComplete={battle.isComplete}
          result={battle.result}
          busy={battle.busy}
          onAttack={() => battle.manualAttack("enemy_floor_" + currentFloor)}
          onContinue={battle.continueBattle}
          onReset={battle.resetBattle}
        />
      ) : (
        <button
          className="action-btn"
          disabled={battle.busy}
          onClick={() => battle.startBattle(currentFloor)}
        >
          {t("tower.climb", locale)} ▶
        </button>
      )}
    </div>
  );
}
