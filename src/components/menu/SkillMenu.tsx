import { useMemo, useState } from "react";
import {
  getPlayerCatalogSkills,
  getSkillsByType,
  isSkillUnlocked,
} from "../../engine/skills";
import type { SkillType } from "../../engine/skills/skillTypes";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import { formatDialogMessage } from "../../utils/formatDialogMessage";
import { t, type Locale } from "../../utils/i18n";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { SkillEquipPanel } from "../skills/SkillEquipPanel";
import { SkillCategorySection } from "./SkillCategorySection";
import { SkillMenuOwnedSection } from "./SkillMenuOwnedSection";
import { SkillMenuTypeFilters } from "./SkillMenuTypeFilters";
import { SkillStatGrid } from "./SkillStatGrid";
import { isDefaultExpanded, sortCatalogSkills } from "./skillMenuConstants";
import { useSkillMenuProgression } from "./useSkillMenuProgression";

interface SkillMenuProps {
  locale: Locale;
  userId: string | null;
  skillPoints: number;
  onSkillPointsChange?: (skillPoints: number) => void;
}

export function SkillMenu({
  locale,
  userId,
  skillPoints,
  onSkillPointsChange,
}: SkillMenuProps) {
  const [typeFilter, setTypeFilter] = useState<SkillType | "all">("all");
  const progression = useSkillMenuProgression({ userId, onSkillPointsChange });

  useDismissOnOutside(
    !isDefaultExpanded(progression.expandedCategories) &&
      !progression.pendingUnlock &&
      !progression.pendingRespec,
    progression.collapseCategories,
    [".shop-section"]
  );

  const catalogSkills = useMemo(() => {
    const base = sortCatalogSkills(getPlayerCatalogSkills());
    if (typeFilter === "all") return base;
    return getSkillsByType(typeFilter);
  }, [typeFilter]);

  const ownedSkills = useMemo(
    () =>
      catalogSkills.filter((skill) =>
        isSkillUnlocked(skill, progression.unlockedSkillIds)
      ),
    [catalogSkills, progression.unlockedSkillIds]
  );

  const pendingUnlock = progression.pendingUnlock;

  return (
    <div className="skill-menu">
      <SkillEquipPanel
        locale={locale}
        userId={userId}
        loadout={progression.loadout}
        unlockedSkillIds={progression.unlockedSkillIds}
        onLoadoutChange={progression.setLoadout}
      />

      <SkillMenuOwnedSection
        locale={locale}
        userId={userId}
        skillPoints={skillPoints}
        ownedSkills={ownedSkills}
        unlockedSkillIds={progression.unlockedSkillIds}
        unlockingId={progression.unlockingId}
        canRespec={progression.canRespec}
        pendingRespec={progression.pendingRespec}
        respecBusy={progression.respecBusy}
        onRespecRequest={() => progression.setPendingRespec(true)}
        onRespecConfirm={() => void progression.handleRespec()}
        onRespecCancel={() => {
          if (!progression.respecBusy) progression.setPendingRespec(false);
        }}
        onUnlockRequest={progression.setPendingUnlock}
      />

      <SkillMenuTypeFilters
        locale={locale}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      <div className="shop-sections">
        <SkillCategorySection
          category="all"
          labelKey="skills.category.all"
          itemCount={catalogSkills.length}
          locale={locale}
          expanded={progression.expandedCategories.has("all")}
          onToggle={() => progression.toggleCategory("all")}
        >
          <SkillStatGrid
            locale={locale}
            userId={userId}
            skills={catalogSkills}
            unlockedSkillIds={progression.unlockedSkillIds}
            skillPoints={skillPoints}
            unlockingId={progression.unlockingId}
            allowUnlock
            layout="catalog"
            onUnlockRequest={progression.setPendingUnlock}
          />
        </SkillCategorySection>
      </div>

      {pendingUnlock ? (
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
          busy={progression.unlockingId === pendingUnlock.skillId}
          onConfirm={() => void progression.handleUnlock(pendingUnlock.skillId)}
          onCancel={() => {
            if (progression.unlockingId !== pendingUnlock.skillId) {
              progression.setPendingUnlock(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}
