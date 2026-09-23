import {
  getSkillUnlockSpCost,
  isSkillUnlocked,
} from "../../engine/skills";
import type { SkillDefinition } from "../../engine/skills/types";
import { t, type Locale } from "../../utils/i18n";
import { SkillIconTile } from "../skills/SkillIconTile";

export type PendingSkillUnlock = {
  skillId: string;
  label: string;
  cost: number;
};

interface SkillStatGridProps {
  locale: Locale;
  skills: SkillDefinition[];
  unlockedSkillIds: string[];
  unlockingId: string | null;
  onSkillSelect: (skill: SkillDefinition) => void;
  embedded?: boolean;
  layout?: "default" | "catalog";
}

export function SkillStatGrid({
  locale,
  skills,
  unlockedSkillIds,
  unlockingId,
  onSkillSelect,
  embedded = false,
  layout = "default",
}: SkillStatGridProps) {
  const tiles = skills.map((skill) => {
    const label = t(skill.stringId, locale);
    const unlocked = isSkillUnlocked(skill, unlockedSkillIds);
    const locked = !unlocked;
    const unlockCost = getSkillUnlockSpCost(skill);
    const badgeText = locked
      ? `${t("skills.unlock_sp", locale)} ${unlockCost}`
      : undefined;

    return (
      <SkillIconTile
        key={skill.id}
        skill={skill}
        label={label}
        locked={locked}
        badgeText={badgeText}
        disabled={unlockingId === skill.id}
        onClick={() => onSkillSelect(skill)}
      />
    );
  });

  if (embedded) return <>{tiles}</>;

  const gridClass =
    layout === "catalog"
      ? "stat-grid stat-grid--skills stat-grid--skills-catalog stat-grid--skill-icons"
      : "stat-grid stat-grid--skills stat-grid--skill-icons";

  return <div className={gridClass}>{tiles}</div>;
}
