import { useMemo, useState } from "react";
import {
  equipSkillToLoadout,
  getPlayerCatalogSkills,
  getSkillUnlockSpCost,
  getSkillsByType,
  isSkillUnlocked,
  normalizeSkillId,
  unequipSkillFromLoadout,
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
import { SkillMenuTypeFilters } from "./SkillMenuTypeFilters";
import { SkillStatGrid } from "./SkillStatGrid";
import { isDefaultExpanded, sortCatalogSkills } from "./skillMenuConstants";
import { usePersistSkillLoadout } from "../../hooks/usePersistSkillLoadout";
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
  const { saveLoadout, busy: loadoutBusy } = usePersistSkillLoadout(
    userId,
    locale,
    progression.setLoadout
  );

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

  const detailIsEquipped = detailSkill
    ? progression.loadout.equippedSlots.some(
        (id) => normalizeSkillId(id) === normalizeSkillId(detailSkill.id)
      )
    : false;

  const detailCanEquip =
    Boolean(detailSkill) &&
    detailUnlocked &&
    Boolean(userId) &&
    !detailIsEquipped &&
    equipSkillToLoadout(progression.loadout, detailSkill!.id).ok;

  const equipFromCatalogDetail = () => {
    if (!detailSkill) return;
    const result = equipSkillToLoadout(progression.loadout, detailSkill.id);
    if (!result.ok) return;
    void saveLoadout(result.loadout).then(() => setDetailSkill(null));
  };

  const unequipFromCatalogDetail = () => {
    if (!detailSkill) return;
    const next = unequipSkillFromLoadout(progression.loadout, detailSkill.id);
    if (!next) return;
    void saveLoadout(next).then(() => setDetailSkill(null));
  };

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
        canRespec={progression.canRespec}
        onRespecRequest={() => progression.setPendingRespec(true)}
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
          equipActionLabel={t("skills.equip_action", locale)}
          onEquip={detailCanEquip ? equipFromCatalogDetail : undefined}
          onUnequip={
            detailUnlocked && detailIsEquipped
              ? unequipFromCatalogDetail
              : undefined
          }
          onUnlockRequest={requestUnlockFromDetail}
          onClose={() => setDetailSkill(null)}
          busy={
            progression.unlockingId === detailSkill.id || loadoutBusy
          }
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
