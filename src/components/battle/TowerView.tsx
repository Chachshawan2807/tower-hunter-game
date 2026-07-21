import { useMemo } from "react";
import {
  defaultSkillLoadout,
  getEquippedBattleSkillIds,
  getEquippedPassiveSkillIds,
  getSkillById,
} from "../../engine/skills";
import { t, type Locale } from "../../utils/i18n";
import { playUiClick } from "../../hooks/useGameAudio";
import { GameIcon } from "../ui/icons";
import { ZoneBattleArena } from "../zones";
import { TowerScrollColumn } from "./TowerScrollColumn";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { useBattle } from "../../hooks/useBattle";

interface TowerViewProps {
  locale: Locale;
  currentFloor: number;
  climbFloor: number;
  playerLevel: number;
  playerEquipment: CharacterEquipmentVisual;
  battle: ReturnType<typeof useBattle>;
}

export function TowerView({
  locale,
  currentFloor,
  climbFloor,
  playerLevel: _playerLevel,
  playerEquipment,
  battle,
}: TowerViewProps) {
  const inBattle =
    battle.displayedEvents.length > 0 ||
    battle.battleSnapshot !== null ||
    battle.busy;

  const floorLabel = t("tower.floor", locale);

  const unlockedSkillIds =
    battle.loadoutContext?.playerUnlockedSkillIds ?? [];

  const equippedSlots =
    battle.loadoutContext?.playerLoadout.equippedSlots ??
    defaultSkillLoadout(unlockedSkillIds).equippedSlots;

  const battleSkillIds = useMemo(
    () => getEquippedBattleSkillIds({ equippedSlots, battlePrefs: { healOverrideEnabled: true, healThreshold: 0.35 } }),
    [equippedSlots]
  );

  const passiveSkillIds = useMemo(
    () => getEquippedPassiveSkillIds({ equippedSlots, battlePrefs: { healOverrideEnabled: true, healThreshold: 0.35 } }),
    [equippedSlots]
  );

  const passiveLabels = useMemo(
    () =>
      passiveSkillIds
        .map((id) => t(getSkillById(id).stringId, locale))
        .join(" · "),
    [passiveSkillIds, locale]
  );

  const playerSkillUpgrades =
    battle.loadoutContext?.playerSkillUpgrades ?? {};

  const autoBattle = battle.loadoutContext?.autoBattle ?? true;

  return (
    <div className="tower-view">
      <div className="tower-view__center">
        <TowerScrollColumn
          locale={locale}
          currentFloor={currentFloor}
          floorLabel={floorLabel}
        />
      </div>

      <div className="tower-view__footer">
        {inBattle ? (
          <ZoneBattleArena
            floor={currentFloor}
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
            playerEquipment={playerEquipment}
            onSpeedChange={battle.setSpeed}
            onSkip={battle.skip}
            onAttack={() => battle.manualAttack(`enemy_floor_${currentFloor}`)}
            onSkill={(skillId, targetId) => battle.manualSkill(skillId, targetId)}
            equippedSlots={battleSkillIds}
            passiveLabel={passiveLabels || null}
            playerSkillUpgrades={playerSkillUpgrades}
            unlockedSkillIds={unlockedSkillIds}
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
              <span className="action-btn--climb__icon" aria-hidden="true">
                <GameIcon name="skills" size={22} />
              </span>
              <span className="action-btn--climb__label">
                {t("tower.climb", locale)}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
