import {
  canUseSkill,
  getSkillById,
  getSkillCooldownRemaining,
  isSkillUnlocked,
  resolveEffectiveSkill,
} from "../../engine/skills";
import type { SkillUpgradeRanks } from "../../engine/skills/types";
import type { BattleEntity } from "../../engine/types";
import { t, type Locale } from "../../utils/i18n";
import { GameIcon, skillIconName } from "../ui/icons";

const EMPTY_UPGRADES: SkillUpgradeRanks = {
  damage: 0,
  cooldown: 0,
  mpCost: 0,
};

interface BattleActiveSkillsProps {
  locale: Locale;
  busy: boolean;
  activeSlots: [string, string];
  playerEntity?: BattleEntity;
  enemyTargetId: string;
  playerSkillUpgrades: Record<string, SkillUpgradeRanks>;
  unlockedSkillIds: string[];
  onSkill: (skillId: string, targetId: string) => void;
}

export function BattleActiveSkills({
  locale,
  busy,
  activeSlots,
  playerEntity,
  enemyTargetId,
  playerSkillUpgrades,
  unlockedSkillIds,
  onSkill,
}: BattleActiveSkillsProps) {
  return (
    <div className="battle-active-skills" aria-label="Active skills">
      {activeSlots.map((skillId, index) => {
        const base = getSkillById(skillId);
        if (!isSkillUnlocked(base, unlockedSkillIds)) {
          return null;
        }

        const upgrades = playerSkillUpgrades[skillId] ?? EMPTY_UPGRADES;
        const effective = resolveEffectiveSkill(base, upgrades);
        const cd = playerEntity
          ? getSkillCooldownRemaining(playerEntity, skillId)
          : 0;
        const onCooldown = cd > 0;
        const canAfford =
          playerEntity && playerEntity.stats.mp >= effective.mpCost;
        const usable =
          playerEntity && canUseSkill(playerEntity, effective, unlockedSkillIds);
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
  );
}
