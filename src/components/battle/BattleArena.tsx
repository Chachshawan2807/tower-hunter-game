import { memo, useCallback, useMemo } from "react";

import {
  getSkillById,
  isPassiveSkillType,
  resolveEffectiveSkill,
} from "../../engine/skills";
import { EMPTY_SKILL_UPGRADES } from "../../engine/skills/types";
import { useEntityAnimation } from "../../hooks/useEntityAnimation";
import { BattleArenaEntities } from "./BattleArenaEntities";
import { BattleArenaResult } from "./BattleArenaResult";
import { BattleCommandBar } from "./BattleCommandBar";
import type { BattleArenaProps } from "./battleArenaTypes";
import {
  getEntityHp,
  joinBattleClasses,
  resolveBattleOutcomeDisplay,
} from "./battleArenaUtils";
import { useBattle3dEnabled } from "../../hooks/useBattle3dSetting";
import { BattleArena3DSlot } from "./BattleArena3DSlot";
import { useBattleArenaKeyboard } from "./useBattleArenaKeyboard";

export type { BattleArenaProps } from "./battleArenaTypes";

export const BattleArena = memo(function BattleArena({
  locale,
  floor: floorProp,
  snapshot,
  displayedEvents,
  actionRequired,
  autoBattle,
  isComplete,
  result,
  rewards,
  busy,
  isPlaying,
  speed,
  skillPath = "imperial",
  playerDisplayName,
  playerEquipment,
  onSpeedChange,
  onToggleAuto,
  onOpenSettings,
  onSkill,
  commandSlotIds,
  playerSkillUpgrades = {},
  unlockedSkillIds = [],
  enemyTargetId,
  battleSessionKey,
  onReset,
  onNextFloor,
  nextFloorDisabled,
}: BattleArenaProps) {
  const playerHp = useMemo(() => getEntityHp(snapshot, "player"), [snapshot]);
  const enemyHp = useMemo(() => getEntityHp(snapshot, "enemy"), [snapshot]);
  const playerEntity = snapshot?.entities.find((e) => e.side === "player");
  const enemyEntity = snapshot?.entities.find((e) => e.side === "enemy");

  const playerAnim = useEntityAnimation({
    entityId: playerEntity?.id ?? "player",
    entitySide: "player",
    displayedEvents,
    isBattleComplete: isComplete,
    battleResult: result,
  });

  const enemyAnim = useEntityAnimation({
    entityId: enemyEntity?.id ?? "enemy",
    entitySide: "enemy",
    displayedEvents,
    isBattleComplete: isComplete,
    battleResult: result,
  });

  const tryUseSlot = useCallback(
    (slotIndex: number) => {
      if (!onSkill || !playerEntity || busy) return;
      const skillId = commandSlotIds[slotIndex];
      if (!skillId) return;
      const base = getSkillById(skillId);
      if (base.skillType && isPassiveSkillType(base.skillType)) return;
      const effective = resolveEffectiveSkill(
        base,
        playerSkillUpgrades[skillId] ?? EMPTY_SKILL_UPGRADES
      );
      const targetId =
        effective.targetType === "self"
          ? playerEntity.id
          : enemyTargetId;
      if (!targetId) return;
      onSkill(skillId, targetId);
    },
    [onSkill, enemyTargetId, playerEntity, busy, commandSlotIds, playerSkillUpgrades]
  );

  const manualTurn =
    actionRequired && !autoBattle && !isComplete && !busy;

  useBattleArenaKeyboard({
    enabled: manualTurn,
    onSlot: tryUseSlot,
    slotCount: commandSlotIds.length,
  });

  const { showResult, outcome } = resolveBattleOutcomeDisplay(
    snapshot,
    isComplete,
    result
  );

  const battle3d = useBattle3dEnabled();
  const battleFloor = snapshot?.floor ?? floorProp ?? 1;

  return (
    <div
      className={joinBattleClasses(
        "battle-arena",
        "battle-arena--command",
        battle3d && "battle-arena--3d",
        showResult && "battle-arena--result"
      )}
      role="region"
      aria-label="Battle"
    >
      <div
        className={joinBattleClasses(
          "battle-arena__stage",
          battle3d && "battle-arena__stage--3d",
          !battle3d && Boolean(snapshot) && "battle-arena__stage--sprites"
        )}
      >
        {battle3d && snapshot ? (
          <BattleArena3DSlot
            key={battleSessionKey ?? "battle-3d"}
            floor={battleFloor}
            playerAnim={playerAnim}
            enemyAnim={enemyAnim}
            battleSessionKey={battleSessionKey}
          />
        ) : null}
        {snapshot ? (
          <BattleArenaEntities
            locale={locale}
            snapshot={snapshot}
            skillPath={skillPath}
            playerEquipment={playerEquipment}
            playerEntity={playerEntity}
            enemyEntity={enemyEntity}
            playerHp={playerHp}
            enemyHp={enemyHp}
            playerAnim={playerAnim}
            enemyAnim={enemyAnim}
            hideSprites={battle3d}
            battleFloor={battleFloor}
            playerDisplayName={playerDisplayName}
          />
        ) : (
          <p className="battle-arena__loading" role="status" aria-live="polite">
            …
          </p>
        )}
        {showResult && outcome ? (
          <div className="battle-result-overlay" role="presentation">
            <BattleArenaResult
              locale={locale}
              result={outcome}
              rewards={rewards}
              onReset={onReset}
              onNextFloor={onNextFloor}
              nextFloorDisabled={nextFloorDisabled}
            />
          </div>
        ) : null}
      </div>

      <BattleCommandBar
        locale={locale}
        speed={speed}
        autoBattle={autoBattle}
        busy={busy}
        manualTurn={manualTurn}
        slotSkillIds={commandSlotIds}
        playerEntity={playerEntity}
        enemyTargetId={enemyTargetId}
        playerSkillUpgrades={playerSkillUpgrades}
        unlockedSkillIds={unlockedSkillIds}
        onOpenSettings={onOpenSettings}
        onSpeedChange={onSpeedChange}
        onToggleAuto={onToggleAuto}
        onSkill={onSkill}
      />
    </div>
  );
});
