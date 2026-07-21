import { useCallback, useEffect, useMemo, useState } from "react";
import {
  defaultSkillLoadout,
  getPlayerCatalogSkills,
  getSkillsByType,
  isSkillUnlocked,
} from "../../engine/skills";
import type { SkillLoadout } from "../../engine/skills/loadout";
import type { SkillDefinition } from "../../engine/skills/types";
import type { SkillType } from "../../engine/skills/skillTypes";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import { api } from "../../utils/api";
import { formatDialogMessage } from "../../utils/formatDialogMessage";
import { t, type Locale } from "../../utils/i18n";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { SkillEquipPanel } from "../skills/SkillEquipPanel";
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
  skillPoints: number;
  onSkillPointsChange?: (skillPoints: number) => void;
}

const DEFAULT_EXPANDED: SkillMenuCategory[] = ["owned"];
const TYPE_FILTERS: Array<SkillType | "all"> = [
  "all",
  "active",
  "passive",
  "cc",
  "movement",
];

function sortCatalogSkills(skills: SkillDefinition[]): SkillDefinition[] {
  return [...skills].sort(
    (a, b) => (a.catalogTier ?? a.slotTier) - (b.catalogTier ?? b.slotTier)
  );
}

function isDefaultExpanded(expanded: Set<SkillMenuCategory>): boolean {
  return expanded.size === 1 && expanded.has("owned");
}

export function SkillMenu({
  locale,
  userId,
  skillPoints,
  onSkillPointsChange,
}: SkillMenuProps) {
  const [unlockedSkillIds, setUnlockedSkillIds] = useState<string[]>([]);
  const [loadout, setLoadout] = useState<SkillLoadout>(
    defaultSkillLoadout([])
  );
  const [typeFilter, setTypeFilter] = useState<SkillType | "all">("all");
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [pendingUnlock, setPendingUnlock] = useState<PendingSkillUnlock | null>(
    null
  );
  const [pendingRespec, setPendingRespec] = useState(false);
  const [respecBusy, setRespecBusy] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Set<SkillMenuCategory>
  >(() => new Set(DEFAULT_EXPANDED));

  useDismissOnOutside(
    !isDefaultExpanded(expandedCategories) && !pendingUnlock && !pendingRespec,
    () => setExpandedCategories(new Set(DEFAULT_EXPANDED)),
    [".shop-section"]
  );

  const fetchProgression = useCallback(async () => {
    if (!userId) {
      setUnlockedSkillIds([]);
      setLoadout(defaultSkillLoadout([]));
      return;
    }
    try {
      const data = await api.getSkillProgression(userId);
      setUnlockedSkillIds(data.unlockedSkillIds ?? []);
      setLoadout(data.loadout ?? defaultSkillLoadout(data.unlockedSkillIds));
      onSkillPointsChange?.(data.skillPoints);
    } catch {
      setUnlockedSkillIds([]);
    }
  }, [userId, onSkillPointsChange]);

  useEffect(() => {
    void fetchProgression();
  }, [fetchProgression]);

  const catalogSkills = useMemo(() => {
    const base = sortCatalogSkills(getPlayerCatalogSkills());
    if (typeFilter === "all") return base;
    return getSkillsByType(typeFilter);
  }, [typeFilter]);

  const ownedSkills = useMemo(
    () =>
      catalogSkills.filter((skill) =>
        isSkillUnlocked(skill, unlockedSkillIds)
      ),
    [catalogSkills, unlockedSkillIds]
  );

  const toggleCategory = (category: SkillMenuCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
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
    } finally {
      setUnlockingId(null);
    }
  };

  const handleRespec = async () => {
    if (!userId || respecBusy) return;
    setRespecBusy(true);
    try {
      const result = await api.respecSkills(userId);
      setUnlockedSkillIds([]);
      setLoadout(defaultSkillLoadout([]));
      onSkillPointsChange?.(result.skillPoints);
      setPendingRespec(false);
    } finally {
      setRespecBusy(false);
    }
  };

  return (
    <div className="skill-menu">
      <div className="skill-menu__section ui-section">
        <div className="stat-grid stat-grid--skills skill-menu__sp-row">
          <div
            className="stat-item stat-item--status-point skill-menu__sp-card"
            aria-label={`${t("skills.skill_points", locale)} ${skillPoints}`}
          >
            <span className="stat-item__status-row">
              <span className="stat-item__status-label">
                {t("skills.skill_points", locale)}
              </span>
              <span className="stat-item__status-value tabular-nums">
                {skillPoints}
              </span>
              <button
                type="button"
                className="stat-item__reset-btn"
                disabled={!userId || respecBusy || pendingRespec}
                aria-label={t("skills.reset.aria", locale)}
                title={t("skills.reset.aria", locale)}
                onClick={() => setPendingRespec(true)}
              >
                {t("skills.reset", locale)}
              </button>
            </span>
          </div>
        </div>
      </div>

      <SkillEquipPanel
        locale={locale}
        userId={userId}
        loadout={loadout}
        unlockedSkillIds={unlockedSkillIds}
        onLoadoutChange={setLoadout}
      />

      <div className="skill-menu__filters">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={
              typeFilter === filter
                ? "skill-filter-btn skill-filter-btn--active"
                : "skill-filter-btn"
            }
            onClick={() => setTypeFilter(filter)}
          >
            {filter === "all" ? t("skills.filter.all", locale) : filter}
          </button>
        ))}
      </div>

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
          itemCount={catalogSkills.length}
          locale={locale}
          expanded={expandedCategories.has("all")}
          onToggle={() => toggleCategory("all")}
        >
          <SkillStatGrid
            locale={locale}
            userId={userId}
            skills={catalogSkills}
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

      {pendingRespec && (
        <ConfirmDialog
          locale={locale}
          title={t("skills.reset_confirm_title", locale)}
          message={t("skills.reset_confirm_message", locale)}
          confirmLabel={t("skills.reset", locale)}
          confirmTone="crimson"
          busy={respecBusy}
          onConfirm={() => void handleRespec()}
          onCancel={() => {
            if (!respecBusy) setPendingRespec(false);
          }}
        />
      )}
    </div>
  );
}
