import { useEffect, useMemo, useState } from "react";
import { defaultSkillLoadout } from "../../engine/skills";
import { t, type Locale } from "../../utils/i18n";
import { playUiClick } from "../../hooks/useGameAudio";
import { GameIcon } from "../ui/icons";
import { ZoneBattleArena } from "../zones";
import { getBattleCommandSlotIds } from "./battleEquipSlots";
import { TowerScrollColumn } from "./TowerScrollColumn";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { useBattle } from "../../hooks/useBattle";

interface TowerViewProps {
  locale: Locale;
  currentFloor: number;
  climbFloor: number;
  playerLevel: number;
  playerDisplayName: string;
  playerEquipment: CharacterEquipmentVisual;
  battle: ReturnType<typeof useBattle>;
  onOpenSettings: () => void;
  onExitBattle: () => void;
  towerScrollGeneration?: number;
}

export function TowerView({
  locale,
  currentFloor: _currentFloor,
  climbFloor,
  playerLevel: _playerLevel,
  playerDisplayName,
  playerEquipment,
  battle,
  onOpenSettings,
  onExitBattle,
  towerScrollGeneration = 0,
}: TowerViewProps) {
  const inBattle = battle.sessionId !== null;
  const maxUnlockedFloor = climbFloor;

  const [selectedFloor, setSelectedFloor] = useState(maxUnlockedFloor);

  useEffect(() => {
    setSelectedFloor((prev) =>
      prev > 0 && prev <= maxUnlockedFloor ? prev : maxUnlockedFloor
    );
  }, [maxUnlockedFloor]);

  useEffect(() => {
    if (towerScrollGeneration > 0) {
      setSelectedFloor(maxUnlockedFloor);
    }
  }, [towerScrollGeneration, maxUnlockedFloor]);

  const fightFloor = inBattle ? battle.floor : selectedFloor;

  const floorLabel = t("tower.floor", locale);

  const unlockedSkillIds =
    battle.loadoutContext?.playerUnlockedSkillIds ?? [];

  const equippedSlots =
    battle.loadoutContext?.playerLoadout.equippedSlots ??
    defaultSkillLoadout(unlockedSkillIds).equippedSlots;

  const commandSlotIds = useMemo(
    () => getBattleCommandSlotIds(equippedSlots),
    [equippedSlots]
  );

  const playerSkillUpgrades =
    battle.loadoutContext?.playerSkillUpgrades ?? {};

  const autoBattle = battle.loadoutContext?.autoBattle ?? true;

  const nextFloorTarget = fightFloor + 1;
  const nextFloorDisabled =
    battle.result === "lose" || battle.busy || nextFloorTarget > 100;

  const canFight =
    selectedFloor >= 1 &&
    selectedFloor <= maxUnlockedFloor &&
    !battle.busy;

  const battleArena = (
    <ZoneBattleArena
      floor={fightFloor}
      locale={locale}
      snapshot={battle.battleSnapshot}
      displayedEvents={battle.displayedEvents}
      actionRequired={battle.actionRequired}
      autoBattle={autoBattle}
      isComplete={battle.isComplete}
      result={battle.result}
      rewards={battle.rewards}
      busy={battle.busy}
      isPlaying={battle.isPlaying}
      speed={battle.speed}
      playerEquipment={playerEquipment}
      playerDisplayName={playerDisplayName}
      onSpeedChange={battle.setSpeed}
      onToggleAuto={(enabled) => void battle.setAutoBattle(enabled)}
      onOpenSettings={onOpenSettings}
      onSkill={(skillId, targetId) => battle.manualSkill(skillId, targetId)}
      commandSlotIds={commandSlotIds}
      playerSkillUpgrades={playerSkillUpgrades}
      unlockedSkillIds={unlockedSkillIds}
      enemyTargetId={`enemy_floor_${fightFloor}`}
      battleSessionKey={battle.sessionId}
      onReset={onExitBattle}
      onNextFloor={() => {
        battle.resetBattle();
        void battle.startBattle(nextFloorTarget);
      }}
      nextFloorDisabled={nextFloorDisabled}
    />
  );

  return (
    <div className={`tower-view${inBattle ? " tower-view--battle" : ""}`}>
      {!inBattle ? (
        <div className="tower-view__center">
          <TowerScrollColumn
            locale={locale}
            maxUnlockedFloor={maxUnlockedFloor}
            selectedFloor={selectedFloor}
            onSelectFloor={setSelectedFloor}
            floorLabel={floorLabel}
            scrollGeneration={towerScrollGeneration}
          />
        </div>
      ) : null}

      {inBattle ? (
        <div
          className="tower-battle-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Battle"
        >
          {battleArena}
        </div>
      ) : (
        <div className="tower-view__footer">
          {battle.startError && (
            <p className="tower-start-error" role="alert">
              {battle.startError}
            </p>
          )}
          {battle.offlineMessage && (
            <p className="tower-offline-notice" role="status">
              {t("common.offline_queued", locale)}
            </p>
          )}
          <button
            className="action-btn action-btn--climb"
            disabled={!canFight}
            onClick={() => {
              playUiClick();
              void battle.startBattle(selectedFloor);
            }}
            aria-label={t("tower.fight", locale)}
          >
            <span className="action-btn--climb__icon" aria-hidden="true">
              <GameIcon name="sword-cross" size={22} />
            </span>
            <span className="action-btn--climb__label">
              {t("tower.fight", locale)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
