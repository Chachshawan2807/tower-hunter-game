import { useCallback, useEffect, useState } from "react";
import {
  getSkillUnlockSpCost,
  getSkillsForPath,
  isSkillUnlocked,
} from "../../engine/skills";
import type { SkillDefinition } from "../../engine/skills/types";
import type { SkillPath } from "../../engine/types";
import { api } from "../../utils/api";
import { t, type Locale } from "../../utils/i18n";
import { GameIcon } from "../ui/icons";

interface SkillMenuProps {
  locale: Locale;
  userId: string | null;
  activePath: SkillPath;
  skillPoints: number;
  onSkillPointsChange?: (skillPoints: number) => void;
}

const SKILL_SLOT_COUNT = 5;

function sortPathSkills(path: SkillPath): SkillDefinition[] {
  return [...getSkillsForPath(path)].sort((a, b) => a.slotTier - b.slotTier);
}

function formatSkillValue(skill: SkillDefinition, locale: Locale): string {
  const parts = [`MP ${skill.mpCost}`];
  if (skill.cooldownTurns > 0) {
    parts.push(`${t("skills.cooldown", locale)} ${skill.cooldownTurns}`);
  }
  return parts.join(" · ");
}

export function SkillMenu({
  locale,
  userId,
  activePath,
  skillPoints,
  onSkillPointsChange,
}: SkillMenuProps) {
  const [unlockedSkillIds, setUnlockedSkillIds] = useState<string[]>([]);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  const fetchUnlocks = useCallback(async () => {
    if (!userId) {
      setUnlockedSkillIds([]);
      return;
    }
    try {
      const data = await api.getSkillProgression(userId);
      setUnlockedSkillIds(data.unlockedSkillIds ?? []);
      onSkillPointsChange?.(data.skillPoints);
    } catch {
      setUnlockedSkillIds([]);
    }
  }, [userId, activePath, onSkillPointsChange]);

  useEffect(() => {
    fetchUnlocks();
  }, [fetchUnlocks]);

  const pathSkills = sortPathSkills(activePath);
  const slots = Array.from({ length: SKILL_SLOT_COUNT }, (_, index) => ({
    skill: pathSkills[index] ?? null,
    label: pathSkills[index]
      ? t(pathSkills[index].stringId, locale)
      : `Skill ${index + 1}`,
  }));

  const handleUnlock = async (skillId: string) => {
    if (!userId || unlockingId) return;
    setUnlockingId(skillId);
    try {
      const result = await api.unlockSkill(userId, skillId);
      setUnlockedSkillIds(result.unlockedSkillIds);
      onSkillPointsChange?.(result.skillPoints);
    } catch {
      // keep current state
    } finally {
      setUnlockingId(null);
    }
  };

  return (
    <div className="skill-menu">
      <div className="skill-menu__section ui-section">
        <div className="stat-grid stat-grid--skills">
          {slots.map(({ skill, label }, index) => {
            const unlocked = skill
              ? isSkillUnlocked(skill, unlockedSkillIds)
              : false;
            const locked = skill !== null && !unlocked;
            const placeholder = skill === null;
            const unlockCost = skill ? getSkillUnlockSpCost(skill) : 0;
            const canUnlock =
              locked &&
              skill &&
              userId &&
              skillPoints >= unlockCost &&
              unlockingId === null;

            const content = (
              <>
                <span className="skill-stat-label">
                  {locked ? (
                    <GameIcon
                      name="lock"
                      size={14}
                      className="skill-stat-label__icon"
                    />
                  ) : null}
                  {label}
                </span>
                <span className="stat-item__value tabular-nums">
                  {skill
                    ? locked
                      ? `${t("skills.unlock_sp", locale)} ${unlockCost}`
                      : formatSkillValue(skill, locale)
                    : "—"}
                </span>
              </>
            );

            if (canUnlock && skill) {
              return (
                <button
                  key={skill.id}
                  type="button"
                  className="stat-item stat-item--locked stat-item--unlockable"
                  onClick={() => handleUnlock(skill.id)}
                  disabled={unlockingId === skill.id}
                >
                  {content}
                </button>
              );
            }

            return (
              <div
                key={skill?.id ?? `skill-slot-${index + 1}`}
                className={`stat-item${locked || placeholder ? " stat-item--locked" : ""}${placeholder ? " stat-item--placeholder" : ""}`}
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
