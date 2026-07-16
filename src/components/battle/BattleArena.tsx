import { memo, useCallback, useEffect, useMemo } from "react";

import {
  canUseSkill,
  getSkillById,
  getSkillCooldownRemaining,
  isSkillUnlocked,
  resolveEffectiveSkill,
} from "../../engine/skills";
import type { SkillUpgradeRanks } from "../../engine/skills/types";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { AnimationEvent, BattleSnapshot } from "../../engine/types";
import type { AnimationSpeed } from "../../hooks/useAnimationQueue";
import { useEntityAnimation } from "../../hooks/useEntityAnimation";
import { t, type Locale } from "../../utils/i18n";
import { CharacterFigure } from "../character/CharacterFigure";
import { GameIcon, skillIconName } from "../ui/icons";
import { CombatFxCanvas } from "./CombatFxCanvas";
import { formatBattleEvent, getBattleEventClass } from "./battleLog";
import { HpBar } from "./HpBar";

const EMPTY_UPGRADES: SkillUpgradeRanks = {
  damage: 0,
  cooldown: 0,
  mpCost: 0,
};

function getEntityHp(snapshot: BattleSnapshot | null, side: "player" | "enemy") {
  const entity = snapshot?.entities.find((e) => e.side === side);
  if (!entity) return { hp: 0, maxHp: 1, percent: 0 };
  const percent = Math.max(0, (entity.stats.hp / entity.stats.maxHp) * 100);
  return {
    hp: Math.ceil(entity.stats.hp),
    maxHp: Math.ceil(entity.stats.maxHp),
    percent,
  };
}

interface BattleArenaProps {
  locale: Locale;
  snapshot: BattleSnapshot | null;
  displayedEvents: AnimationEvent[];
  actionRequired: boolean;
  autoBattle: boolean;
  isComplete: boolean;
  result: "win" | "lose" | null;
  busy: boolean;
  isPlaying: boolean;
  speed: AnimationSpeed;
  skillPath?: "imperial" | "knight" | "vanguard";
  playerEquipment: CharacterEquipmentVisual;
  onSpeedChange: (speed: AnimationSpeed) => void;
  onSkip: () => void;
  onAttack: () => void;
  onSkill?: (skillId: string, targetId: string) => void;
  activeSlots: [string, string];
  autoSkillIds: string[];
  playerSkillUpgrades?: Record<string, SkillUpgradeRanks>;
  enemyTargetId?: string;
  onContinue: () => void;
  onReset: () => void;
}

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
  activeSlots,
  autoSkillIds,
  playerSkillUpgrades = {},
  enemyTargetId,
  onContinue,
  onReset,
}: BattleArenaProps) {
  const player = useMemo(() => getEntityHp(snapshot, "player"), [snapshot]);
  const enemy = useMemo(() => getEntityHp(snapshot, "enemy"), [snapshot]);
  const recent = useMemo(() => displayedEvents.slice(-6), [displayedEvents]);
  const playerEntity = snapshot?.entities.find((e) => e.side === "player");
  const enemyEntity = snapshot?.entities.find((e) => e.side === "enemy");
  const playerLevel = playerEntity?.stats.level ?? 1;

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

  const autoLabel = useMemo(() => {
    if (autoSkillIds.length === 0) return null;
    return autoSkillIds
      .map((id) => {
        const skill = getSkillById(id);
        return t(skill.stringId, locale);
      })
      .join(" · ");
  }, [autoSkillIds, locale]);

  const tryUseSlot = useCallback(
    (slotIndex: 0 | 1) => {
      if (!onSkill || !enemyTargetId || !playerEntity || busy) return;

      const skillId = activeSlots[slotIndex];
      const base = getSkillById(skillId);
      if (!isSkillUnlocked(base, playerLevel)) return;

      const effective = resolveEffectiveSkill(
        base,
        playerSkillUpgrades[skillId] ?? EMPTY_UPGRADES
      );
      if (!canUseSkill(playerEntity, effective, playerLevel)) return;

      const targetId =
        effective.targetType === "self" ? playerEntity.id : enemyTargetId;
      onSkill(skillId, targetId);
    },
    [
      onSkill,
      enemyTargetId,
      playerEntity,
      busy,
      activeSlots,
      playerLevel,
      playerSkillUpgrades,
    ]
  );

  useEffect(() => {
    if (!actionRequired || autoBattle || isComplete || isPlaying || busy) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "1") {
        event.preventDefault();
        tryUseSlot(0);
      } else if (event.key === "2") {
        event.preventDefault();
        tryUseSlot(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actionRequired, autoBattle, isComplete, isPlaying, busy, tryUseSlot]);

  const showManualActions =
    actionRequired && !isComplete && !isPlaying && !autoBattle;

  const showResult = isComplete && result !== null && !isPlaying;

  const arenaClass = [
    "battle-arena",
    showResult ? "battle-arena--result" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={arenaClass} role="region" aria-label="Battle">
      <div className="battle-arena__frame texture-dark-iron">
        <CombatFxCanvas displayedEvents={displayedEvents} />

        <div className="battle-controls" aria-label="Playback speed">
          <button
            className={`speed-btn ${speed === 2 ? "speed-btn--active" : ""}`}
            onClick={() => onSpeedChange(2)}
            disabled={!isPlaying}
            aria-label="Speed x2"
            aria-pressed={speed === 2}
          >
            ×2
          </button>
          <button
            className={`speed-btn ${speed === 4 ? "speed-btn--active" : ""}`}
            onClick={() => onSpeedChange(4)}
            disabled={!isPlaying}
            aria-label="Speed x4"
            aria-pressed={speed === 4}
          >
            ×4
          </button>
          <button
            className="speed-btn speed-btn--skip"
            onClick={onSkip}
            disabled={!isPlaying}
            aria-label="Skip animation"
          >
            Skip
          </button>
        </div>

        <div className="battle-entities battle-entities--sprites">
          <div className="battle-entity-slot battle-entity-slot--player">
            <CharacterFigure
              equipment={playerEquipment}
              path={skillPath}
              side="player"
              animState={playerAnim}
              statusEffects={playerEntity?.statusEffects.map((s) => s.type)}
              label={t("battle.player", locale)}
              size="battle"
            />
            <HpBar
              label="HP"
              hp={player.hp}
              maxHp={player.maxHp}
              percent={player.percent}
              variant="player"
            />
          </div>

          <span className="battle-vs" aria-hidden="true">
            <GameIcon name="sword-cross" size={22} />
          </span>

          <div className="battle-entity-slot battle-entity-slot--enemy">
            <CharacterFigure
              side="enemy"
              animState={enemyAnim}
              floor={snapshot?.floor}
              statusEffects={enemyEntity?.statusEffects.map((s) => s.type)}
              label={t("battle.enemy", locale)}
              size="battle"
            />
            <HpBar
              label="HP"
              hp={enemy.hp}
              maxHp={enemy.maxHp}
              percent={enemy.percent}
              variant="enemy"
            />
          </div>
        </div>

        <div
          className="battle-log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Battle events"
        >
          {recent.length === 0 ? (
            <div className="battle-log__entry battle-log__entry--idle">—</div>
          ) : (
            recent.map((ev, i) => (
              <div
                key={`${ev.type}-${i}-${ev.value ?? ""}`}
                className={`battle-log__entry ${getBattleEventClass(ev)}`.trim()}
              >
                <span className="battle-log__text">
                  {formatBattleEvent(ev, locale, snapshot?.entities)}
                </span>
              </div>
            ))
          )}
        </div>

        {actionRequired && !isComplete && !isPlaying && (
          <p className="battle-turn-hint">{t("battle.waiting", locale)}</p>
        )}

        {showResult && (
          <button
            type="button"
            className={`result-action result-action--${result}`}
            onClick={onReset}
            aria-label={
              result === "win"
                ? `${t("battle.win", locale)} — ${t("battle.continue", locale)}`
                : `${t("battle.lose", locale)} — ${t("battle.continue", locale)}`
            }
          >
            <span className="result-action__title">
              {result === "win" ? t("battle.win", locale) : t("battle.lose", locale)}
            </span>
            <span className="result-action__hint">{t("battle.continue", locale)}</span>
          </button>
        )}

        {showManualActions && autoLabel && (
          <p className="battle-auto-info" aria-label={`Auto: ${autoLabel}`}>
            Auto: {autoLabel}
          </p>
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
                <div className="battle-active-skills" aria-label="Active skills">
                  {activeSlots.map((skillId, index) => {
                    const base = getSkillById(skillId);
                    if (!isSkillUnlocked(base, playerLevel)) {
                      return null;
                    }

                    const upgrades =
                      playerSkillUpgrades[skillId] ?? EMPTY_UPGRADES;
                    const effective = resolveEffectiveSkill(base, upgrades);
                    const cd = playerEntity
                      ? getSkillCooldownRemaining(playerEntity, skillId)
                      : 0;
                    const onCooldown = cd > 0;
                    const canAfford =
                      playerEntity &&
                      playerEntity.stats.mp >= effective.mpCost;
                    const usable =
                      playerEntity &&
                      canUseSkill(playerEntity, effective, playerLevel);
                    const targetId =
                      effective.targetType === "self"
                        ? playerEntity!.id
                        : enemyTargetId;
                    const name = t(base.stringId, locale);
                    const stateClass = onCooldown
                      ? "battle-skill-btn--cd"
                      : !canAfford
                        ? "battle-skill-btn--mp"
                        : "battle-skill-btn--ready";

                    return (
                      <button
                        key={`${skillId}-${index}`}
                        className={`battle-skill-btn battle-skill-btn--active ${stateClass}`}
                        disabled={busy || !usable}
                        title={
                          onCooldown
                            ? `${name} — ${t("skills.cooldown", locale)} ${cd}`
                            : `${name} (MP ${effective.mpCost})`
                        }
                        aria-label={
                          onCooldown
                            ? `${name}, ${t("skills.cooldown", locale)} ${cd}`
                            : `${name}, MP ${effective.mpCost}`
                        }
                        onClick={() => onSkill(skillId, targetId)}
                      >
                        <span className="battle-skill-btn__icon" aria-hidden="true">
                          <GameIcon name={skillIconName(skillId)} size={20} />
                        </span>
                        <span className="battle-skill-btn__label">{name}</span>
                        <span
                          className={`battle-skill-btn__cost${!canAfford ? " battle-skill-btn__cost--low" : ""}`}
                        >
                          MP{effective.mpCost}
                        </span>
                        <span className="battle-skill-btn__key" aria-hidden="true">
                          {index + 1}
                        </span>
                        {onCooldown && (
                          <span className="battle-skill-btn__cd-overlay" aria-hidden="true">
                            <span className="battle-skill-btn__cd">{cd}</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
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
