import { useCallback, useMemo, useState, type CSSProperties } from "react";
import {
  getPlayerCatalogSkills,
  isSkillUnlocked,
  MAX_EQUIP_SLOTS,
} from "../../engine/skills";
import type { SkillLoadout } from "../../engine/skills/loadout";
import type { SkillDefinition } from "../../engine/skills/types";
import { runWithOfflineQueue } from "../../client/offline/queueMutation";
import { api } from "../../utils/api";
import { createActionIdempotencyKey } from "../../utils/idempotencyKey";
import { t, type Locale } from "../../utils/i18n";
import { SkillDetailDialog } from "./SkillDetailDialog";
import { SkillEquipSlot } from "./SkillEquipSlot";
import { SkillEquipSlotPicker } from "./SkillEquipSlotPicker";

interface SkillEquipPanelProps {
  locale: Locale;
  userId: string | null;
  loadout: SkillLoadout;
  unlockedSkillIds: string[];
  onLoadoutChange: (loadout: SkillLoadout) => void;
  canRespec?: boolean;
  onRespecRequest?: () => void;
}

function getSlotSkillId(
  equippedSlots: string[],
  slotIndex: number
): string | null {
  return equippedSlots[slotIndex] ?? null;
}

export function SkillEquipPanel({
  locale,
  userId,
  loadout,
  unlockedSkillIds,
  onLoadoutChange,
  canRespec = false,
  onRespecRequest,
}: SkillEquipPanelProps) {
  const [busy, setBusy] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const [detailSkill, setDetailSkill] = useState<SkillDefinition | null>(null);
  const [detailSlotIndex, setDetailSlotIndex] = useState<number | null>(null);

  const catalog = useMemo(
    () =>
      getPlayerCatalogSkills().filter((skill) =>
        isSkillUnlocked(skill, unlockedSkillIds)
      ),
    [unlockedSkillIds]
  );

  const saveLoadout = useCallback(
    async (next: SkillLoadout) => {
      onLoadoutChange(next);
      if (!userId) return;
      setBusy(true);
      setQueueMessage(null);
      try {
        const idempotencyKey = createActionIdempotencyKey(
          "skill_loadout",
          userId,
          next.equippedSlots.join(",")
        );
        const result = await runWithOfflineQueue(
          "skill_loadout",
          userId,
          idempotencyKey,
          { loadoutJson: JSON.stringify(next) },
          () => api.patchSkillLoadout(userId, next)
        );

        if (result.status === "queued") {
          setQueueMessage(t("common.offline_queued", locale));
          return;
        }
        if (result.status === "error") {
          throw result.error;
        }

        onLoadoutChange(result.data.loadout);
      } finally {
        setBusy(false);
      }
    },
    [userId, onLoadoutChange, locale]
  );

  const equippedCount = loadout.equippedSlots.length;

  const pickerForSlot = (_slotIndex: number): SkillDefinition[] => {
    return catalog.filter(
      (skill) => !loadout.equippedSlots.includes(skill.id)
    );
  };

  const handleEquip = (slotIndex: number, skillId: string) => {
    const slots = [...loadout.equippedSlots];
    if (slotIndex < slots.length) {
      slots[slotIndex] = skillId;
    } else if (slotIndex === slots.length) {
      slots.push(skillId);
    } else {
      return;
    }
    void saveLoadout({ ...loadout, equippedSlots: slots });
    setActiveSlot(null);
    setDetailSkill(null);
    setDetailSlotIndex(null);
  };

  const handleUnequip = (slotIndex: number) => {
    const slots = loadout.equippedSlots.filter((_, index) => index !== slotIndex);
    void saveLoadout({ ...loadout, equippedSlots: slots });
    setActiveSlot(null);
  };

  const openPickerDetail = (skill: SkillDefinition, slotIndex: number) => {
    setDetailSkill(skill);
    setDetailSlotIndex(slotIndex);
  };

  const equipFromDetail = () => {
    if (detailSkill && detailSlotIndex !== null) {
      handleEquip(detailSlotIndex, detailSkill.id);
    }
  };

  const equipSlotLabel =
    detailSlotIndex !== null ? t("skills.equip_action", locale) : undefined;

  const activePickerSkills =
    activeSlot !== null ? pickerForSlot(activeSlot) : [];
  const activePickerColumns = Math.min(
    4,
    Math.max(1, activePickerSkills.length)
  );
  const activeSlotSkillId =
    activeSlot !== null
      ? getSlotSkillId(loadout.equippedSlots, activeSlot)
      : null;
  const activeSlotLabel = t("skills.equip_action", locale);

  const equipStageStyle =
    activeSlot !== null
      ? ({
          ["--skill-equip-active-slot" as string]: String(activeSlot),
          ["--skill-equip-picker-cols" as string]: String(activePickerColumns),
        } as CSSProperties)
      : undefined;

  return (
    <section
      className="skill-equip-panel ui-section"
      aria-label={t("skills.equip_title", locale)}
    >
      <div className="skill-equip-panel__header">
        <h3 className="skill-equip-panel__title">
          {t("skills.equip_title", locale)}
        </h3>
        <div className="skill-equip-panel__header-actions">
          <span className="skill-equip-panel__count tabular-nums">
            {equippedCount}/{MAX_EQUIP_SLOTS}
          </span>
          {onRespecRequest ? (
            <button
              type="button"
              className="skill-menu__reset-btn"
              disabled={!canRespec}
              aria-label={t("skills.reset.aria", locale)}
              title={t("skills.reset.aria", locale)}
              onClick={onRespecRequest}
            >
              {t("skills.reset", locale)}
            </button>
          ) : null}
        </div>
      </div>
      {queueMessage ? (
        <p className="skill-equip-panel__message" role="status">
          {queueMessage}
        </p>
      ) : null}

      <div
        className={
          activeSlot !== null
            ? "skill-equip-stage skill-equip-stage--open"
            : "skill-equip-stage"
        }
        style={equipStageStyle}
      >
        <div className="skill-equip-rail" role="group" aria-label={t("skills.equip_title", locale)}>
          {Array.from({ length: MAX_EQUIP_SLOTS }, (_, slotIndex) => {
            const skillId = getSlotSkillId(loadout.equippedSlots, slotIndex);
            const canEquip = slotIndex <= equippedCount;

            return (
              <SkillEquipSlot
                key={slotIndex}
                locale={locale}
                slotIndex={slotIndex}
                skillId={skillId}
                canEquip={canEquip}
                isActive={activeSlot === slotIndex}
                hasPinnedTooltip={activeSlot !== null}
                onActivate={() =>
                  setActiveSlot((current) =>
                    current === slotIndex ? null : slotIndex
                  )
                }
                onDismissActive={() => setActiveSlot(null)}
              />
            );
          })}
        </div>

        {activeSlot !== null ? (
          <div
            className="skill-equip-picker-panel"
            role="region"
            aria-label={activeSlotLabel}
          >
            <span className="sr-only">{activeSlotLabel}</span>
            <SkillEquipSlotPicker
              locale={locale}
              skills={activePickerSkills}
              columnCount={activePickerColumns}
              busy={busy}
              onSkillSelect={(skill) => openPickerDetail(skill, activeSlot)}
            />
            {activeSlotSkillId ? (
              <button
                type="button"
                className="skill-equip-picker-panel__unequip"
                disabled={busy}
                onClick={() => handleUnequip(activeSlot)}
              >
                {t("bag.unequip", locale)}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {detailSkill ? (
        <SkillDetailDialog
          locale={locale}
          skill={detailSkill}
          unlocked
          equipActionLabel={equipSlotLabel}
          onEquip={detailSlotIndex !== null ? equipFromDetail : undefined}
          onClose={() => {
            setDetailSkill(null);
            setDetailSlotIndex(null);
          }}
          busy={busy}
        />
      ) : null}
    </section>
  );
}
