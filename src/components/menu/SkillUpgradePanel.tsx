import { useState } from "react";
import { getSkillById } from "../../engine/skills";
import {
  canUpgradeBranch,
  spCostForNextRank,
  type UpgradeBranch,
} from "../../engine/skills/skillPoints";
import {
  api,
  type SkillCatalogEntry,
  type SkillUpgradeRanks,
  type SkillUpgradeResponse,
} from "../../utils/api";
import { t, type Locale } from "../../utils/i18n";

const BRANCHES: Array<{
  branch: UpgradeBranch;
  labelKey: string;
  icon: string;
}> = [
  { branch: "damage", labelKey: "skills.upgrade.damage", icon: "⚔" },
  { branch: "cooldown", labelKey: "skills.upgrade.cd", icon: "⏱" },
  { branch: "mpCost", labelKey: "skills.upgrade.mp", icon: "💧" },
];

function renderStars(rank: number): string {
  return Array.from({ length: 3 }, (_, i) => (i < rank ? "★" : "☆")).join("");
}

type ProgressionSkill = SkillCatalogEntry & {
  unlocked: boolean;
  upgrades: SkillUpgradeRanks;
};

interface SkillUpgradePanelProps {
  locale: Locale;
  userId: string | null;
  skill: ProgressionSkill;
  skillPoints: number;
  onUpgraded: (result: SkillUpgradeResponse, skillId: string) => void;
}

export function SkillUpgradePanel({
  locale,
  userId,
  skill,
  skillPoints,
  onUpgraded,
}: SkillUpgradePanelProps) {
  const [busy, setBusy] = useState<UpgradeBranch | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const baseSkill = getSkillById(skill.id);

  const handleUpgrade = async (branch: UpgradeBranch) => {
    if (!userId || busy) return;
    setBusy(branch);
    setMessage(null);
    try {
      const result = await api.upgradeSkill(userId, {
        skillId: skill.id,
        branch,
      });
      onUpgraded(result, skill.id);
      setMessage(t("skills.upgrade.success", locale));
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : t("skills.upgrade.error", locale)
      );
    } finally {
      setBusy(null);
    }
  };

  const statParts: string[] = [`MP ${skill.mpCost}`];
  if (skill.cooldownTurns > 0) {
    statParts.push(`${t("skills.cooldown", locale)} ${skill.cooldownTurns}`);
  }
  if (skill.damageMultiplier) {
    statParts.push(`×${skill.damageMultiplier.toFixed(2)}`);
  }
  if (skill.kind === "heal" && skill.healPercent) {
    statParts.push(`${Math.round(skill.healPercent * 100)}% HP`);
  }

  return (
    <div className="skill-upgrade">
      <div className="skill-upgrade__header">
        <span className="skill-upgrade__icon">
          {skill.unlocked ? skill.icon : "🔒"}
        </span>
        <div>
          <div className="skill-upgrade__name">{t(skill.stringId, locale)}</div>
          <div className="skill-upgrade__stats">{statParts.join(" · ")}</div>
          {!skill.unlocked && (
            <div className="skill-upgrade__locked">
              {t("skills.unlock_at", locale)} {skill.unlockLevel}
            </div>
          )}
        </div>
      </div>

      <div className="skill-upgrade__branches">
        {BRANCHES.map(({ branch, labelKey, icon }) => {
          const rank = skill.upgrades[branch];
          const check = canUpgradeBranch(baseSkill, branch, skill.upgrades);
          const cost = spCostForNextRank(rank);
          const maxed = rank >= 3;
          const disabled =
            !skill.unlocked ||
            !check.allowed ||
            maxed ||
            skillPoints < cost ||
            busy !== null;

          return (
            <div
              key={branch}
              className={`skill-upgrade__row ${disabled ? "skill-upgrade__row--disabled" : ""}`}
            >
              <span className="skill-upgrade__branch">
                {icon} {t(labelKey, locale)}
              </span>
              <span className="skill-upgrade__stars" aria-label={`Rank ${rank}`}>
                {renderStars(rank)}
              </span>
              <button
                type="button"
                className="skill-upgrade__btn"
                disabled={disabled || !userId}
                onClick={() => handleUpgrade(branch)}
              >
                {busy === branch
                  ? "..."
                  : maxed
                    ? t("skills.upgrade.maxed", locale)
                    : `${cost} SP`}
              </button>
            </div>
          );
        })}
      </div>

      {message && <p className="skill-upgrade__message">{message}</p>}
    </div>
  );
}
