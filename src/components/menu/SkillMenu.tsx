import { useMemo, useState } from "react";
import {
  getPlayerCatalogSkills,
  getSkillUnlockSpCost,
  getSkillsByType,
  isSkillUnlocked,
  sortSkillsByEquipOrder,
} from "../../engine/skills";
import type { SkillDefinition } from "../../engine/skills/types";
import type { SkillType } from "../../engine/skills/skillTypes";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import { formatDialogMessage } from "../../utils/formatDialogMessage";
import { t, type Locale } from "../../utils/i18n";
import { SkillDetailDialog } from "../skills/SkillDetailDialog";
import { SkillEquipPanel } from "../skills/SkillEquipPanel";
import { ConfirmDialog } from "../ui/ConfirmDialog";
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
  const [detailSkill, setDetailSkill] = useState<SkillDefinition | null>(null);
  const progression = useSkillMenuProgression({ userId, onSkillPointsChange });

  useDismissOnOutside(
    !isDefaultExpanded(progression.expandedCategories) &&
      !progression.pendingUnlock &&
      !progression.pendingRespec &&
      !detailSkill,
    progression.collapseCategories,
    [".shop-section"]
  );

  const catalogSkills = useMemo(() => {
    const base = sortCatalogSkills(getPlayerCatalogSkills());
    if (typeFilter === "all") return base;
    return getSkillsByType(typeFilter);
  }, [typeFilter]);

  const ownedSkills = useMemo(() => {
    const unlocked = catalogSkills.filter((skill) =>
      isSkillUnlocked(skill, progression.unlockedSkillIds)
    );
    return sortSkillsByEquipOrder(
      unlocked,
      progression.loadout.equippedSlots
    );
  }, [
    catalogSkills,
    progression.unlockedSkillIds,
    progression.loadout.equippedSlots,
  ]);

  const pendingUnlock = progression.pendingUnlock;

  const openSkillDetail = (skill: SkillDefinition) => {
    setDetailSkill(skill);
  };

  const detailUnlocked = detailSkill
    ? isSkillUnlocked(detailSkill, progression.unlockedSkillIds)
    : false;
  const detailUnlockCost = detailSkill
    ? getSkillUnlockSpCost(detailSkill)
    : 0;
  const detailCanUnlock =
    Boolean(detailSkill) &&
    !detailUnlocked &&
    Boolean(userId) &&
    skillPoints >= detailUnlockCost &&
    progression.unlockingId === null;

  const requestUnlockFromDetail = () => {
    if (!detailSkill) return;
    const label = t(detailSkill.stringId, locale);
    setDetailSkill(null);
    progression.setPendingUnlock({
      skillId: detailSkill.id,
      label,
      cost: detailUnlockCost,
    });
  };

  return (
    <div className="skill-menu">
      {progression.offlineMessage ? (
        <p className="skill-menu__offline-notice" role="status">
          {t(progression.offlineMessage, locale)}
        </p>
      ) : null}
      <SkillEquipPanel
        locale={locale}
        userId={userId}
        loadout={progression.loadout}
        unlockedSkillIds={progression.unlockedSkillIds}
        onLoadoutChange={progression.setLoadout}
      />

      <SkillMenuOwnedSection
        locale={locale}
        ownedSkills={ownedSkills}
        unlockedSkillIds={progression.unlockedSkillIds}
        unlockingId={progression.unlockingId}
        canRespec={progression.canRespec}
        onRespecRequest={() => progression.setPendingRespec(true)}
        onSkillSelect={openSkillDetail}
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
            skills={catalogSkills}
            unlockedSkillIds={progression.unlockedSkillIds}
            unlockingId={progression.unlockingId}
            layout="catalog"
            onSkillSelect={openSkillDetail}
          />
        </SkillCategorySection>
      </div>

      {detailSkill ? (
        <SkillDetailDialog
          locale={locale}
          skill={detailSkill}
          unlocked={detailUnlocked}
          unlockCost={detailUnlockCost}
          canUnlock={detailCanUnlock}
          onUnlockRequest={requestUnlockFromDetail}
          onClose={() => setDetailSkill(null)}
          busy={progression.unlockingId === detailSkill.id}
        />
      ) : null}

      {progression.pendingRespec ? (
        <ConfirmDialog
          placement="overlay-panel"
          locale={locale}
          title={t("skills.reset_confirm_title", locale)}
          message={t("skills.reset_confirm_message", locale)}
          confirmLabel={t("skills.reset", locale)}
          confirmTone="crimson"
          busy={progression.respecBusy}
          onConfirm={() => void progression.handleRespec()}
          onCancel={() => {
            if (!progression.respecBusy) progression.setPendingRespec(false);
          }}
        />
      ) : null}

      {pendingUnlock ? (
        <ConfirmDialog
          placement="overlay-panel"
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
