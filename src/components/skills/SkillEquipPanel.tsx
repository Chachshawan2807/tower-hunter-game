import { useCallback, useMemo, useState } from "react";
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
import { SkillEquipSlot } from "./SkillEquipSlot";

interface SkillEquipPanelProps {
  locale: Locale;
  userId: string | null;
  loadout: SkillLoadout;
  unlockedSkillIds: string[];
  onLoadoutChange: (loadout: SkillLoadout) => void;
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
}: SkillEquipPanelProps) {
  const [busy, setBusy] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);

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

  const pickerForSlot = (slotIndex: number): SkillDefinition[] => {
    const currentId = getSlotSkillId(loadout.equippedSlots, slotIndex);
    return catalog.filter(
      (skill) =>
        skill.id === currentId || !loadout.equippedSlots.includes(skill.id)
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
  };

  const handleUnequip = (slotIndex: number) => {
    const slots = loadout.equippedSlots.filter((_, index) => index !== slotIndex);
    void saveLoadout({ ...loadout, equippedSlots: slots });
    setActiveSlot(null);
  };

  return (
    <section
      className="skill-equip-panel ui-section"
      aria-label={t("skills.equip_title", locale)}
    >
      <div className="skill-equip-panel__header">
        <h3 className="skill-equip-panel__title">
          {t("skills.equip_title", locale)}
        </h3>
        <span className="skill-equip-panel__count tabular-nums">
          {equippedCount}/{MAX_EQUIP_SLOTS}
        </span>
      </div>
      {queueMessage ? (
        <p className="skill-equip-panel__message" role="status">
          {queueMessage}
        </p>
      ) : null}

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
              pickerSkills={pickerForSlot(slotIndex)}
              isActive={activeSlot === slotIndex}
              hasPinnedTooltip={activeSlot !== null}
              busy={busy}
              onActivate={() =>
                setActiveSlot((current) =>
                  current === slotIndex ? null : slotIndex
                )
              }
              onDismissActive={() => setActiveSlot(null)}
              onEquip={(nextSkillId) => handleEquip(slotIndex, nextSkillId)}
              onUnequip={
                skillId ? () => handleUnequip(slotIndex) : undefined
              }
            />
          );
        })}
      </div>
    </section>
  );
}
