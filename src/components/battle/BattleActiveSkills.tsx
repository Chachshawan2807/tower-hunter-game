import { useState } from "react";
import {
  canUseSkill,
  getSkillById,
  getSkillCooldownRemaining,
  isSkillUnlocked,
  resolveEffectiveSkill,
} from "../../engine/skills";
import { EMPTY_SKILL_UPGRADES } from "../../engine/skills/types";
import type { SkillUpgradeRanks } from "../../engine/skills/types";
import type { BattleEntity } from "../../engine/types";
import { t, type Locale } from "../../utils/i18n";
import { SkillDetailDialog } from "../skills/SkillDetailDialog";

interface BattleActiveSkillsProps {
  locale: Locale;
  busy: boolean;
  equippedSlots: string[];
  playerEntity?: BattleEntity;
  enemyTargetId: string;
  playerSkillUpgrades: Record<string, SkillUpgradeRanks>;
  unlockedSkillIds: string[];
  onSkill: (skillId: string, targetId: string) => void;
}

export function BattleActiveSkills({
  locale,
  busy,
  equippedSlots,
  playerEntity,
  enemyTargetId,
  playerSkillUpgrades,
  unlockedSkillIds,
  onSkill,
}: BattleActiveSkillsProps) {
  const [detailSkillId, setDetailSkillId] = useState<string | null>(null);

  const detailBase = detailSkillId ? getSkillById(detailSkillId) : null;
  const detailEffective =
    detailBase && detailSkillId
      ? resolveEffectiveSkill(
          detailBase,
          playerSkillUpgrades[detailSkillId] ?? EMPTY_SKILL_UPGRADES
        )
      : null;

  return (
    <>
      <div
        className="battle-active-skills"
        aria-label={t("battle.equipped_skills", locale)}
      >
        {equippedSlots.map((skillId, index) => {
          const base = getSkillById(skillId);
          if (!isSkillUnlocked(base, unlockedSkillIds)) {
            return null;
          }

          const upgrades = playerSkillUpgrades[skillId] ?? EMPTY_SKILL_UPGRADES;
          const effective = resolveEffectiveSkill(base, upgrades);
          const cd = playerEntity
            ? getSkillCooldownRemaining(playerEntity, skillId)
            : 0;
          const onCooldown = cd > 0;
          const canAfford =
            playerEntity && playerEntity.stats.mp >= effective.mpCost;
          const usable =
            playerEntity &&
            canUseSkill(playerEntity, effective, unlockedSkillIds);
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
            <div key={`${skillId}-${index}`} className="battle-skill-btn-wrap">
              <button
                type="button"
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
                  <span
                    className="battle-skill-btn__cd-overlay"
                    aria-hidden="true"
                  >
                    <span className="battle-skill-btn__cd">{cd}</span>
                  </span>
                )}
              </button>
              <button
                type="button"
                className="battle-skill-btn__info"
                aria-label={t("skills.detail.info_aria", locale, { skill: name })}
                disabled={busy}
                onClick={() => setDetailSkillId(skillId)}
              >
                {t("skills.detail.info_short", locale)}
              </button>
            </div>
          );
        })}
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
