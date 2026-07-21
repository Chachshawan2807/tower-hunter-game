import {
  getSkillUnlockSpCost,
  isSkillUnlocked,
} from "../../engine/skills";
import type { SkillDefinition } from "../../engine/skills/types";
import { t, type Locale } from "../../utils/i18n";
import { SkillListCard } from "../skills/SkillListCard";

export type PendingSkillUnlock = {
  skillId: string;
  label: string;
  cost: number;
};

interface SkillStatGridProps {
  locale: Locale;
  userId: string | null;
  skills: SkillDefinition[];
  unlockedSkillIds: string[];
  skillPoints: number;
  unlockingId: string | null;
  allowUnlock: boolean;
  onUnlockRequest: (pending: PendingSkillUnlock) => void;
  /** Render skill cards only — parent supplies the stat grid. */
  embedded?: boolean;
  /** Catalog grid: 3 compact columns; default keeps 2 columns. */
  layout?: "default" | "catalog";
}

function formatSkillValue(skill: SkillDefinition, locale: Locale): string {
  const parts = [`MP ${skill.mpCost}`];
  if (skill.cooldownTurns > 0) {
    parts.push(`${t("skills.cooldown", locale)} ${skill.cooldownTurns}`);
  }
  return parts.join(" · ");
}

export function SkillStatGrid({
  locale,
  userId,
  skills,
  unlockedSkillIds,
  skillPoints,
  unlockingId,
  allowUnlock,
  onUnlockRequest,
  embedded = false,
  layout = "default",
}: SkillStatGridProps) {
  const cards = skills.map((skill) => {
    const label = t(skill.stringId, locale);
    const unlocked = isSkillUnlocked(skill, unlockedSkillIds);
    const locked = !unlocked;
    const unlockCost = getSkillUnlockSpCost(skill);
    const canUnlock =
      allowUnlock &&
      locked &&
      userId &&
      skillPoints >= unlockCost &&
      unlockingId === null;

    return (
      <SkillListCard
        key={skill.id}
        label={label}
        meta={
          locked
            ? `${t("skills.unlock_sp", locale)} ${unlockCost}`
            : formatSkillValue(skill, locale)
        }
        locked={locked}
        disabled={unlockingId === skill.id}
        onClick={
          canUnlock
            ? () =>
                onUnlockRequest({
                  skillId: skill.id,
                  label,
                  cost: unlockCost,
                })
            : undefined
        }
      />
    );
  });

  if (embedded) return <>{cards}</>;

  const gridClass =
    layout === "catalog"
      ? "stat-grid stat-grid--skills stat-grid--skills-catalog"
      : "stat-grid stat-grid--skills";

  return <div className={gridClass}>{cards}</div>;
}
