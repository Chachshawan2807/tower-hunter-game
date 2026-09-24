import { useState } from "react";
import { getSkillById, resolveEffectiveSkill } from "../../engine/skills";
import { EMPTY_SKILL_UPGRADES } from "../../engine/skills/types";
import type { SkillUpgradeRanks } from "../../engine/skills/types";
import type { BattleEntity } from "../../engine/types";
import type { AnimationSpeed } from "../../hooks/useAnimationQueue";
import { t, type Locale } from "../../utils/i18n";
import { playUiClick } from "../../hooks/useGameAudio";
import { GameIcon } from "../ui/icons";
import { SkillDetailDialog } from "../skills/SkillDetailDialog";
import { BattleCommandSkillButton } from "./BattleCommandSkillButton";

interface BattleCommandBarProps {
  locale: Locale;
  speed: AnimationSpeed;
  autoBattle: boolean;
  busy: boolean;
  manualTurn: boolean;
  slotSkillIds: string[];
  playerEntity?: BattleEntity;
  enemyTargetId?: string;
  playerSkillUpgrades: Record<string, SkillUpgradeRanks>;
  unlockedSkillIds: string[];
  onOpenSettings: () => void;
  onSpeedChange: (speed: AnimationSpeed) => void;
  onToggleAuto: (enabled: boolean) => void;
  onSkill?: (skillId: string, targetId: string) => void;
}

export function BattleCommandBar({
  locale,
  speed,
  autoBattle,
  busy,
  manualTurn,
  slotSkillIds,
  playerEntity,
  enemyTargetId,
  playerSkillUpgrades,
  unlockedSkillIds,
  onOpenSettings,
  onSpeedChange,
  onToggleAuto,
  onSkill,
}: BattleCommandBarProps) {
  const [detailSkillId, setDetailSkillId] = useState<string | null>(null);
  const detailBase = detailSkillId ? getSkillById(detailSkillId) : null;
  const detailEffective =
    detailBase && detailSkillId
      ? resolveEffectiveSkill(
          detailBase,
          playerSkillUpgrades[detailSkillId] ?? EMPTY_SKILL_UPGRADES
        )
      : null;

  const toggleSpeed = () => {
    playUiClick();
    onSpeedChange(speed === 2 ? 1 : 2);
  };

  const toggleAuto = () => {
    playUiClick();
    onToggleAuto(!autoBattle);
  };

  return (
    <>
      <div className="battle-command-bar" role="toolbar" aria-label="Battle controls">
        <div className="battle-command-bar__left">
          <button
            type="button"
            className="battle-command-btn"
            onClick={() => {
              playUiClick();
              onOpenSettings();
            }}
            aria-label={t("settings.title", locale)}
          >
            <GameIcon name="settings" size={22} />
          </button>
          <button
            type="button"
            className="battle-command-btn battle-command-btn--text"
            onClick={toggleSpeed}
            aria-label={`Speed x${speed}`}
          >
            ×{speed}
          </button>
          <button
            type="button"
            className={`battle-command-btn battle-command-btn--text battle-command-btn--auto${autoBattle ? " battle-command-btn--auto-on" : ""}`}
            onClick={toggleAuto}
            aria-pressed={autoBattle}
            aria-label={t("tower.auto", locale)}
          >
            {t("tower.auto", locale)}
          </button>
        </div>

        <div
          className="battle-command-bar__skills"
          aria-label={t("battle.equipped_skills", locale)}
        >
          {slotSkillIds.map((skillId, index) =>
            !skillId ? (
              <div
                key={`empty-${index}`}
                className="battle-command-skill battle-command-skill--empty"
                aria-hidden="true"
              />
            ) : (
              <BattleCommandSkillButton
                key={`${skillId}-${index}`}
                locale={locale}
                skillId={skillId}
                busy={busy}
                manualTurn={manualTurn}
                playerEntity={playerEntity}
                enemyTargetId={enemyTargetId}
                playerSkillUpgrades={playerSkillUpgrades}
                unlockedSkillIds={unlockedSkillIds}
                onShowDetail={setDetailSkillId}
                onSkill={onSkill}
              />
            )
          )}
        </div>
      </div>

      {detailEffective ? (
        <SkillDetailDialog
          locale={locale}
          skill={detailEffective}
          unlocked
          onClose={() => setDetailSkillId(null)}
        />
      ) : null}
    </>
  );
}
