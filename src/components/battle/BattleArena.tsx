import { memo, useCallback, useMemo } from "react";

import { getSkillById } from "../../engine/skills";
import { EMPTY_SKILL_UPGRADES } from "../../engine/skills/types";
import { useEntityAnimation } from "../../hooks/useEntityAnimation";
import { t } from "../../utils/i18n";
import { GameIcon } from "../ui/icons";
import { BattleActiveSkills } from "./BattleActiveSkills";
import { BattleArenaControls } from "./BattleArenaControls";
import { BattleArenaEntities } from "./BattleArenaEntities";
import { BattleArenaLog } from "./BattleArenaLog";
import { BattleArenaResult } from "./BattleArenaResult";
import type { BattleArenaProps } from "./battleArenaTypes";
import { getEntityHp } from "./battleArenaUtils";
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
  onSkip,
  onAttack,
  onSkill,
  equippedSlots,
  passiveLabel,
  playerSkillUpgrades = {},
  unlockedSkillIds = [],
  enemyTargetId,
  onContinue,
  onReset,
}: BattleArenaProps) {
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

  return (
    <div
      className={[
        "battle-arena",
        showResult ? "battle-arena--result" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="region"
      aria-label="Battle"
    >
      <div className="battle-arena__frame texture-dark-iron">
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
        />
        <BattleArenaLog
          locale={locale}
          snapshot={snapshot}
          events={recentEvents}
        />
        {passiveLabel && (
          <p className="battle-passive-info" aria-label={`Passive: ${passiveLabel}`}>
            Passive: {passiveLabel}
          </p>
        )}
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
