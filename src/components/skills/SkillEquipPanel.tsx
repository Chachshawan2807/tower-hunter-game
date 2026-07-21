import { useCallback, useState } from "react";
import {
  getPlayerCatalogSkills,
  getSkillById,
  isSkillUnlocked,
  MAX_EQUIP_SLOTS,
} from "../../engine/skills";
import type { SkillLoadout } from "../../engine/skills/loadout";
import type { SkillDefinition } from "../../engine/skills/types";
import { api } from "../../utils/api";
import { t, type Locale } from "../../utils/i18n";
import { SkillListCard } from "./SkillListCard";

interface SkillEquipPanelProps {
  locale: Locale;
  userId: string | null;
  loadout: SkillLoadout;
  unlockedSkillIds: string[];
  onLoadoutChange: (loadout: SkillLoadout) => void;
}

function formatSkillMeta(skill: SkillDefinition, locale: Locale): string {
  const parts = [`MP ${skill.mpCost}`];
  if (skill.cooldownTurns > 0) {
    parts.push(`${t("skills.cooldown", locale)} ${skill.cooldownTurns}`);
  }
  return parts.join(" · ");
}

export function SkillEquipPanel({
  locale,
  userId,
  loadout,
  unlockedSkillIds,
  onLoadoutChange,
}: SkillEquipPanelProps) {
  const [busy, setBusy] = useState(false);

  const saveLoadout = useCallback(
    async (next: SkillLoadout) => {
      onLoadoutChange(next);
      if (!userId) return;
      setBusy(true);
      try {
        const result = await api.patchSkillLoadout(userId, next);
        onLoadoutChange(result.loadout);
      } finally {
        setBusy(false);
      }
    },
    [userId, onLoadoutChange]
  );

  const moveSlot = (from: number, to: number) => {
    if (to < 0 || to >= loadout.equippedSlots.length) return;
    const slots = [...loadout.equippedSlots];
    const [item] = slots.splice(from, 1);
    slots.splice(to, 0, item);
    void saveLoadout({ ...loadout, equippedSlots: slots });
  };

  const removeSlot = (index: number) => {
    const slots = loadout.equippedSlots.filter((_, i) => i !== index);
    void saveLoadout({ ...loadout, equippedSlots: slots });
  };

  const addSkill = (skillId: string) => {
    if (loadout.equippedSlots.length >= MAX_EQUIP_SLOTS) return;
    if (loadout.equippedSlots.includes(skillId)) return;
    void saveLoadout({
      ...loadout,
      equippedSlots: [...loadout.equippedSlots, skillId],
    });
  };

  const catalog = getPlayerCatalogSkills().filter((s) =>
    isSkillUnlocked(s, unlockedSkillIds)
  );
  const availableToAdd = catalog.filter(
    (s) => !loadout.equippedSlots.includes(s.id)
  );
  const emptySlotCount = MAX_EQUIP_SLOTS - loadout.equippedSlots.length;

  return (
    <section className="shop-section skill-equip-panel" aria-label={t("skills.equip_title", locale)}>
      <div className="skill-equip-panel__header">
        <h3 className="skill-equip-panel__title">
          {t("skills.equip_title", locale)}
        </h3>
        <span className="skill-equip-panel__count tabular-nums">
          {loadout.equippedSlots.length}/{MAX_EQUIP_SLOTS}
        </span>
      </div>

      <div className="stat-grid stat-grid--skills skill-equip-panel__grid">
        {loadout.equippedSlots.map((skillId, index) => {
          const skill = getSkillById(skillId);
          return (
            <SkillListCard
              key={`${skillId}-${index}`}
              className="skill-equip-card"
              label={t(skill.stringId, locale)}
              meta={formatSkillMeta(skill, locale)}
              footer={
                <div className="skill-equip-card__actions">
                  <button
                    type="button"
                    className="skill-equip-card__btn"
                    disabled={busy || index === 0}
                    aria-label={t("skills.equip_move_up", locale)}
                    onClick={() => moveSlot(index, index - 1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="skill-equip-card__btn"
                    disabled={busy || index === loadout.equippedSlots.length - 1}
                    aria-label={t("skills.equip_move_down", locale)}
                    onClick={() => moveSlot(index, index + 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="skill-equip-card__btn skill-equip-card__btn--remove"
                    disabled={busy}
                    aria-label={t("skills.equip_remove", locale)}
                    onClick={() => removeSlot(index)}
                  >
                    ×
                  </button>
                </div>
              }
            />
          );
        })}

        {Array.from({ length: emptySlotCount }, (_, index) => (
          <div
            key={`empty-${index}`}
            className="stat-item stat-item--placeholder skill-equip-card skill-equip-card--empty"
          >
            <span className="skill-stat-label">{t("skills.equip_empty", locale)}</span>
            <span className="stat-item__value tabular-nums">—</span>
          </div>
        ))}
      </div>

      {emptySlotCount > 0 && availableToAdd.length > 0 && (
        <div className="skill-equip-panel__add">
          <label className="skill-equip-panel__add-label" htmlFor="skill-equip-add-select">
            {t("skills.equip_add", locale)}
          </label>
          <select
            id="skill-equip-add-select"
            className="skill-equip-panel__add-select"
            disabled={busy}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) addSkill(e.target.value);
              e.target.value = "";
            }}
          >
            <option value="">—</option>
            {availableToAdd.map((s) => (
              <option key={s.id} value={s.id}>
                {t(s.stringId, locale)}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  );
}
