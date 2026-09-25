import { useMemo } from "react";
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
  playerEquipment: CharacterEquipmentVisual;
  battle: ReturnType<typeof useBattle>;
  onOpenSettings: () => void;
}

export function TowerView({
  locale,
  currentFloor,
  climbFloor,
  playerLevel: _playerLevel,
  playerEquipment,
  battle,
  onOpenSettings,
}: TowerViewProps) {
  const inBattle = battle.sessionId !== null;

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

  const battleArena = (
    <ZoneBattleArena
      floor={currentFloor}
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
      onSpeedChange={battle.setSpeed}
      onToggleAuto={(enabled) => void battle.setAutoBattle(enabled)}
      onOpenSettings={onOpenSettings}
      onSkill={(skillId, targetId) => battle.manualSkill(skillId, targetId)}
      commandSlotIds={commandSlotIds}
      playerSkillUpgrades={playerSkillUpgrades}
      unlockedSkillIds={unlockedSkillIds}
      enemyTargetId={`enemy_floor_${currentFloor}`}
      onReset={battle.resetBattle}
    />
  );

  return (
    <div className={`tower-view${inBattle ? " tower-view--battle" : ""}`}>
      {!inBattle ? (
        <div className="tower-view__center">
          <TowerScrollColumn
            locale={locale}
            currentFloor={currentFloor}
            floorLabel={floorLabel}
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
        </div>
      )}
    </div>
  );
}
