import { t, type Locale } from "../../utils/i18n";
import { BattleArena } from "./BattleArena";
import type { useBattle } from "../../hooks/useBattle";

interface TowerViewProps {
  locale: Locale;
  currentFloor: number;
  battle: ReturnType<typeof useBattle>;
}

export function TowerView({ locale, currentFloor, battle }: TowerViewProps) {
  const inBattle =
    battle.displayedEvents.length > 0 ||
    battle.battleSnapshot !== null ||
    battle.busy;

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
          snapshot={battle.battleSnapshot}
          displayedEvents={battle.displayedEvents}
          actionRequired={battle.actionRequired}
          isComplete={battle.isComplete}
          result={battle.result}
          busy={battle.busy}
          isPlaying={battle.isPlaying}
          speed={battle.speed}
          onSpeedChange={battle.setSpeed}
          onSkip={battle.skip}
          onAttack={() => battle.manualAttack(`enemy_floor_${currentFloor}`)}
          onContinue={battle.continueBattle}
          onReset={battle.resetBattle}
        />
      ) : (
        <button
          className="action-btn"
          disabled={battle.busy}
          onClick={() => battle.startBattle(currentFloor)}
        >
          ▶
        </button>
      )}
    </div>
  );
}
