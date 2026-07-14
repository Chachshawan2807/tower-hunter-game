import { useMemo } from "react";
import { getTowerZone } from "../../engine/art";
import {
  deriveAutoSkills,
  getDefaultLoadout,
  getSkillsForPath,
  isSkillUnlocked,
} from "../../engine/skills";
import { t, type Locale } from "../../utils/i18n";
import { playUiClick } from "../../hooks/useGameAudio";
import { BattleArena } from "./BattleArena";
import { TowerFloorBlock } from "./TowerFloorBlock";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { useBattle } from "../../hooks/useBattle";
import type { SkillPath } from "../../engine/types";

const TOTAL_FLOORS = 100;
const VISIBLE_FLOORS = 7;

interface TowerViewProps {
  locale: Locale;
  currentFloor: number;
  climbFloor: number;
  skillPath: SkillPath;
  playerLevel: number;
  playerEquipment: CharacterEquipmentVisual;
  battle: ReturnType<typeof useBattle>;
}

export function TowerView({
  locale,
  currentFloor,
  climbFloor,
  skillPath,
  playerLevel,
  playerEquipment,
  battle,
}: TowerViewProps) {
  const inBattle =
    battle.displayedEvents.length > 0 ||
    battle.battleSnapshot !== null ||
    battle.busy;

  const isBossFloor = currentFloor % 10 === 0;
  const floorLabel = t("tower.floor", locale);
  const towerZone = useMemo(() => getTowerZone(currentFloor), [currentFloor]);

  const floors = useMemo(() => {
    const start = Math.max(
      1,
      Math.min(
        currentFloor - Math.floor(VISIBLE_FLOORS / 2),
        TOTAL_FLOORS - VISIBLE_FLOORS + 1
      )
    );

    const visible: number[] = [];
    for (let i = VISIBLE_FLOORS - 1; i >= 0; i -= 1) {
      const floor = start + i;
      if (floor <= TOTAL_FLOORS) visible.push(floor);
    }
    return visible;
  }, [currentFloor]);

  const battlePlayerLevel =
    battle.battleSnapshot?.entities.find((e) => e.side === "player")?.stats
      .level ?? playerLevel;

  const activeSlots =
    battle.loadoutContext?.playerLoadout.activeSlots ??
    getDefaultLoadout(skillPath, battlePlayerLevel).activeSlots;

  const autoSkillIds = useMemo(() => {
    const path = battle.loadoutContext?.playerSkillPath ?? skillPath;
    const unlocked = getSkillsForPath(path)
      .filter((s) => isSkillUnlocked(s, battlePlayerLevel))
      .map((s) => s.id);
    return deriveAutoSkills(unlocked, activeSlots);
  }, [battle.loadoutContext, skillPath, battlePlayerLevel, activeSlots]);

  const playerSkillUpgrades =
    battle.loadoutContext?.playerSkillUpgrades ?? {};

  const autoBattle = battle.loadoutContext?.autoBattle ?? true;

  return (
    <div className="tower-view">
      <div className="tower-graphic" aria-hidden="true">
        {floors.map((floor) => (
          <TowerFloorBlock
            key={floor}
            floor={floor}
            currentFloor={currentFloor}
            localeLabel={floorLabel}
          />
        ))}
      </div>

      <span className="tower-zone-label">{t(towerZone.nameKey, locale)}</span>

      <span className="tower-floor-label">
        {floorLabel} {currentFloor}
        <span className="tabular-nums"> / {TOTAL_FLOORS}</span>
      </span>
      {isBossFloor && (
        <span className="tower-floor-sublabel tower-floor-sublabel--boss">
          {t("tower.boss", locale)}
        </span>
      )}

      {inBattle ? (
        <BattleArena
          locale={locale}
          snapshot={battle.battleSnapshot}
          displayedEvents={battle.displayedEvents}
          actionRequired={battle.actionRequired}
          autoBattle={autoBattle}
          isComplete={battle.isComplete}
          result={battle.result}
          busy={battle.busy}
          isPlaying={battle.isPlaying}
          speed={battle.speed}
          skillPath={skillPath}
          playerEquipment={playerEquipment}
          onSpeedChange={battle.setSpeed}
          onSkip={battle.skip}
          onAttack={() => battle.manualAttack(`enemy_floor_${currentFloor}`)}
          onSkill={(skillId, targetId) => battle.manualSkill(skillId, targetId)}
          activeSlots={activeSlots}
          autoSkillIds={autoSkillIds}
          playerSkillUpgrades={playerSkillUpgrades}
          enemyTargetId={`enemy_floor_${currentFloor}`}
          onContinue={battle.continueBattle}
          onReset={battle.resetBattle}
        />
      ) : (
        <>
          {battle.startError && (
            <p className="tower-start-error" role="alert">
              {battle.startError}
            </p>
          )}
          <button
            className="action-btn action-btn--climb"
            disabled={battle.busy || !climbFloor}
            onClick={() => {
              playUiClick();
              void battle.startBattle(climbFloor);
            }}
            aria-label={t("tower.climb", locale)}
          >
            ▶ {t("tower.climb", locale)}
          </button>
        </>
      )}
    </div>
  );
}
