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
import { CombatFxCanvas } from "./CombatFxCanvas";
import { useBattleArenaKeyboard } from "./useBattleArenaKeyboard";

export type { BattleArenaProps } from "./battleArenaTypes";

export const BattleArena = memo(function BattleArena({
  locale,
  snapshot,
  displayedEvents,
  actionRequired,
  autoBattle,
  isComplete,
  result,
  busy,
  isPlaying,
  speed,
  skillPath = "imperial",
  playerEquipment,
  onSpeedChange,
  onToggleAuto,
  onOpenSettings,
  onSkill,
  commandSlotIds,
  playerSkillUpgrades = {},
  unlockedSkillIds = [],
  enemyTargetId,
  onReset,
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
    actionRequired && !autoBattle && !isComplete && !isPlaying && !busy;

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

  return (
    <div
      className={joinBattleClasses(
        "battle-arena",
        "battle-arena--command",
        showResult && "battle-arena--result"
      )}
      role="region"
      aria-label="Battle"
    >
      <div className="battle-arena__stage">
        <CombatFxCanvas displayedEvents={displayedEvents} />
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
            overlayOnly
          />
        ) : (
          <p className="battle-arena__loading" role="status" aria-live="polite">
            …
          </p>
        )}
        {showResult && outcome ? (
          <div className="battle-result-overlay" role="presentation">
            <BattleArenaResult locale={locale} result={outcome} onReset={onReset} />
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
