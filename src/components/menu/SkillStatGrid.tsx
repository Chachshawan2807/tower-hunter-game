import {
  getSkillUnlockSpCost,
  isSkillUnlocked,
} from "../../engine/skills";
import type { SkillDefinition } from "../../engine/skills/types";
import { t, type Locale } from "../../utils/i18n";
import { GameIcon } from "../ui/icons";

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
}: SkillStatGridProps) {
  return (
    <div className="stat-grid stat-grid--skills">
      {skills.map((skill) => {
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

        const content = (
          <>
            <span className="skill-stat-label">
              {locked ? (
                <GameIcon
                  name="lock"
                  size={17}
                  className="skill-stat-label__icon skill-stat-label__icon--locked"
                />
              ) : null}
              {label}
            </span>
            <span className="stat-item__value tabular-nums">
              {locked
                ? `${t("skills.unlock_sp", locale)} ${unlockCost}`
                : formatSkillValue(skill, locale)}
            </span>
          </>
        );

        if (canUnlock) {
          return (
            <button
              key={skill.id}
              type="button"
              className="stat-item stat-item--locked stat-item--unlockable"
              onClick={() =>
                onUnlockRequest({
                  skillId: skill.id,
                  label,
                  cost: unlockCost,
                })
              }
              disabled={unlockingId === skill.id}
            >
              {content}
            </button>
          );
        }

        return (
          <div
            key={skill.id}
            className={`stat-item${locked ? " stat-item--locked" : ""}`}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
