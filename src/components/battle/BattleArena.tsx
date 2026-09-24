import { memo, useCallback, useMemo, useState } from "react";

import type { SkillDefinition } from "../../engine/skills/types";
import { useEntityAnimation } from "../../hooks/useEntityAnimation";
import { t } from "../../utils/i18n";
import { GameIcon } from "../ui/icons";
import { SkillDetailDialog } from "../skills/SkillDetailDialog";
import { SkillPassiveRow } from "../skills/SkillPassiveRow";
import { BattleActiveSkills } from "./BattleActiveSkills";
import { BattleArena3DSlot } from "./BattleArena3DSlot";
import { BattleArenaControls } from "./BattleArenaControls";
import { BattleArenaEntities } from "./BattleArenaEntities";
import { BattleArenaLog } from "./BattleArenaLog";
import { BattleArenaResult } from "./BattleArenaResult";
import type { BattleArenaProps } from "./battleArenaTypes";
import { getEntityHp, joinBattleClasses } from "./battleArenaUtils";
import { CombatFxCanvas } from "./CombatFxCanvas";
import { useBattleArenaKeyboard } from "./useBattleArenaKeyboard";
import { isBattle3dEnabled } from "../../utils/render3dEnv";

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
  onSkip,
  onAttack,
  onSkill,
  equippedSlots,
  passiveSkillIds = [],
  playerSkillUpgrades = {},
  unlockedSkillIds = [],
  enemyTargetId,
  onContinue,
  onReset,
}: BattleArenaProps) {
  const [passiveDetail, setPassiveDetail] = useState<SkillDefinition | null>(
    null
  );
  const playerHp = useMemo(() => getEntityHp(snapshot, "player"), [snapshot]);
  const enemyHp = useMemo(() => getEntityHp(snapshot, "enemy"), [snapshot]);
  const recentEvents = useMemo(
    () => displayedEvents.slice(-6),
    [displayedEvents]
  );
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
      if (!onSkill || !enemyTargetId || !playerEntity || busy) return;
      const skillId = equippedSlots[slotIndex];
      if (!skillId) return;
      onSkill(skillId, enemyTargetId);
    },
    [onSkill, enemyTargetId, playerEntity, busy, equippedSlots]
  );

  useBattleArenaKeyboard({
    enabled:
      actionRequired && !autoBattle && !isComplete && !isPlaying && !busy,
    onSlot: tryUseSlot,
    slotCount: equippedSlots.length,
  });

  const showManualActions =
    actionRequired && !isComplete && !isPlaying && !autoBattle;
  const showResult = isComplete && result !== null && !isPlaying;
  const battle3d = isBattle3dEnabled();
  const battleFloor = snapshot?.floor ?? 1;

  return (
    <div
      className={joinBattleClasses(
        "battle-arena",
        showResult && "battle-arena--result",
        battle3d && "battle-arena--3d"
      )}
      role="region"
      aria-label="Battle"
    >
      <div
        className={joinBattleClasses(
          "battle-arena__frame texture-dark-iron",
          battle3d && "battle-arena__frame--3d"
        )}
      >
        {battle3d ? (
          <BattleArena3DSlot
            floor={battleFloor}
            playerAnim={playerAnim}
            enemyAnim={enemyAnim}
          />
        ) : null}
        <CombatFxCanvas displayedEvents={displayedEvents} />
        <BattleArenaControls
          speed={speed}
          isPlaying={isPlaying}
          onSpeedChange={onSpeedChange}
          onSkip={onSkip}
        />
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
        />
        <BattleArenaLog
          locale={locale}
          snapshot={snapshot}
          events={recentEvents}
        />
        {passiveSkillIds.length > 0 ? (
          <SkillPassiveRow
            locale={locale}
            skillIds={passiveSkillIds}
            onSkillPress={setPassiveDetail}
          />
        ) : null}
        {passiveDetail ? (
          <SkillDetailDialog
            locale={locale}
            skill={passiveDetail}
            unlocked
            onClose={() => setPassiveDetail(null)}
          />
        ) : null}
        {actionRequired && !isComplete && !isPlaying && (
          <p className="battle-turn-hint">{t("battle.waiting", locale)}</p>
        )}
        {showResult && result && (
          <BattleArenaResult locale={locale} result={result} onReset={onReset} />
        )}
        <div className="battle-actions" aria-label="Battle actions">
          {showManualActions && (
            <>
              <button
                className="action-btn action-btn--attack"
                disabled={busy}
                onClick={onAttack}
                aria-label={t("battle.attack", locale)}
              >
                <GameIcon name="skill-sword" size={18} />
                {t("battle.attack", locale)}
              </button>
              {onSkill && enemyTargetId && (
                <BattleActiveSkills
                  locale={locale}
                  busy={busy}
                  equippedSlots={equippedSlots}
                  playerEntity={playerEntity}
                  enemyTargetId={enemyTargetId}
                  playerSkillUpgrades={playerSkillUpgrades}
                  unlockedSkillIds={unlockedSkillIds}
                  onSkill={onSkill}
                />
              )}
            </>
          )}
          {!isComplete && !actionRequired && !busy && !isPlaying && (
            <button
              className="action-btn action-btn--secondary"
              onClick={onContinue}
              aria-label="Continue"
            >
              {t("battle.continue", locale)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
