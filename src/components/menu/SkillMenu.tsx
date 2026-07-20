import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSkillsForPath,
  isSkillUnlocked,
} from "../../engine/skills";
import type { SkillDefinition } from "../../engine/skills/types";
import type { SkillPath } from "../../engine/types";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import { api } from "../../utils/api";
import { formatDialogMessage } from "../../utils/formatDialogMessage";
import { t, type Locale } from "../../utils/i18n";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import {
  SkillCategorySection,
  type SkillMenuCategory,
} from "./SkillCategorySection";
import {
  SkillStatGrid,
  type PendingSkillUnlock,
} from "./SkillStatGrid";

interface SkillMenuProps {
  locale: Locale;
  userId: string | null;
  activePath: SkillPath;
  skillPoints: number;
  onSkillPointsChange?: (skillPoints: number) => void;
}

const DEFAULT_EXPANDED: SkillMenuCategory[] = ["owned"];

function sortPathSkills(path: SkillPath): SkillDefinition[] {
  return [...getSkillsForPath(path)].sort((a, b) => a.slotTier - b.slotTier);
}

function isDefaultExpanded(expanded: Set<SkillMenuCategory>): boolean {
  return expanded.size === 1 && expanded.has("owned");
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
  const [pendingUnlock, setPendingUnlock] = useState<PendingSkillUnlock | null>(
    null
  );
  const [expandedCategories, setExpandedCategories] = useState<
    Set<SkillMenuCategory>
  >(() => new Set(DEFAULT_EXPANDED));

  useDismissOnOutside(
    !isDefaultExpanded(expandedCategories) && !pendingUnlock,
    () => setExpandedCategories(new Set(DEFAULT_EXPANDED)),
    [".shop-section"]
  );

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

  const pathSkills = useMemo(
    () => sortPathSkills(activePath),
    [activePath]
  );
  const ownedSkills = useMemo(
    () =>
      pathSkills.filter((skill) =>
        isSkillUnlocked(skill, unlockedSkillIds)
      ),
    [pathSkills, unlockedSkillIds]
  );

  const toggleCategory = (category: SkillMenuCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleUnlock = async (skillId: string) => {
    if (!userId || unlockingId) return;
    setUnlockingId(skillId);
    try {
      const result = await api.unlockSkill(userId, skillId);
      setUnlockedSkillIds(result.unlockedSkillIds);
      onSkillPointsChange?.(result.skillPoints);
      setPendingUnlock(null);
    } catch {
      // keep current state
    } finally {
      setUnlockingId(null);
    }
  };

  return (
    <div className="skill-menu">
      <div className="shop-sections">
        <SkillCategorySection
          category="owned"
          labelKey="skills.category.owned"
          itemCount={ownedSkills.length}
          locale={locale}
          expanded={expandedCategories.has("owned")}
          onToggle={() => toggleCategory("owned")}
        >
          {ownedSkills.length > 0 ? (
            <SkillStatGrid
              locale={locale}
              userId={userId}
              skills={ownedSkills}
              unlockedSkillIds={unlockedSkillIds}
              skillPoints={skillPoints}
              unlockingId={unlockingId}
              allowUnlock={false}
              onUnlockRequest={setPendingUnlock}
            />
          ) : (
            <p className="shop-empty">{t("skills.owned_empty", locale)}</p>
          )}
        </SkillCategorySection>

        <SkillCategorySection
          category="all"
          labelKey="skills.category.all"
          itemCount={pathSkills.length}
          locale={locale}
          expanded={expandedCategories.has("all")}
          onToggle={() => toggleCategory("all")}
        >
          <SkillStatGrid
            locale={locale}
            userId={userId}
            skills={pathSkills}
            unlockedSkillIds={unlockedSkillIds}
            skillPoints={skillPoints}
            unlockingId={unlockingId}
            allowUnlock
            onUnlockRequest={setPendingUnlock}
          />
        </SkillCategorySection>
      </div>

      {pendingUnlock && (
        <ConfirmDialog
          locale={locale}
          title={t("skills.unlock_confirm_title", locale)}
          message={formatDialogMessage(
            "skills.unlock_confirm_message",
            locale,
            {
              skill: pendingUnlock.label,
              cost: String(pendingUnlock.cost),
            }
          )}
          confirmLabel={t("skills.unlock_confirm_action", locale)}
          busy={unlockingId === pendingUnlock.skillId}
          onConfirm={() => void handleUnlock(pendingUnlock.skillId)}
          onCancel={() => {
            if (unlockingId !== pendingUnlock.skillId) {
              setPendingUnlock(null);
            }
          }}
        />
      )}
    </div>
  );
}
