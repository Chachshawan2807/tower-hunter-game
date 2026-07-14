import { useCallback, useEffect, useRef, useState } from "react";
import { deriveAutoSkills } from "../../engine/skills/loadout";
import type { SkillPath } from "../../engine/types";
import { api } from "../../utils/api";
import { t, type Locale } from "../../utils/i18n";

export interface LoadoutSkillOption {
  id: string;
  stringId: string;
  icon: string;
  unlocked: boolean;
}

interface SkillLoadoutPanelProps {
  locale: Locale;
  userId: string | null;
  path: SkillPath;
  savedSlots: [string, string];
  unlockedIds: string[];
  skills: LoadoutSkillOption[];
  onSaved: (slots: [string, string]) => void;
}

export function SkillLoadoutPanel({
  locale,
  userId,
  path,
  savedSlots,
  unlockedIds,
  skills,
  onSaved,
}: SkillLoadoutPanelProps) {
  const [slots, setSlots] = useState(savedSlots);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRef = useRef(savedSlots);

  useEffect(() => {
    setSlots(savedSlots);
    savedRef.current = savedSlots;
    setError(null);
  }, [savedSlots, path]);

  const unlockedOptions = skills.filter((skill) => skill.unlocked);
  const autoIds = deriveAutoSkills(unlockedIds, slots);
  const autoLabel =
    autoIds.length > 0
      ? autoIds
          .map((id) => {
            const skill = skills.find((s) => s.id === id);
            return skill ? t(skill.stringId, locale) : id;
          })
          .join(", ")
      : "—";

  const persist = useCallback(
    async (next: [string, string]) => {
      if (!userId) return;
      setSaving(true);
      setError(null);
      try {
        const res = await api.patchSkillLoadout(userId, {
          path,
          activeSlots: next,
        });
        savedRef.current = res.loadout.activeSlots;
        onSaved(res.loadout.activeSlots);
      } catch {
        setSlots(savedRef.current);
        setError(t("skills.loadout_error", locale));
      } finally {
        setSaving(false);
      }
    },
    [userId, path, onSaved, locale]
  );

  const scheduleSave = useCallback(
    (next: [string, string]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => persist(next), 500);
    },
    [persist]
  );

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const updateSlot = (index: 0 | 1, skillId: string) => {
    const next: [string, string] =
      index === 0 ? [skillId, slots[1]] : [slots[0], skillId];
    if (next[0] === next[1]) return;
    setSlots(next);
    scheduleSave(next);
  };

  const renderSelect = (index: 0 | 1) => (
    <label key={index} className="skill-loadout__field">
      <span className="skill-loadout__label">
        {t("skills.active_slot", locale)} {index + 1}
      </span>
      <select
        className="skill-loadout__select"
        value={slots[index]}
        disabled={!userId || saving}
        onChange={(e) => updateSlot(index, e.target.value)}
      >
        {unlockedOptions.map((skill) => (
          <option key={skill.id} value={skill.id}>
            {skill.icon} {t(skill.stringId, locale)}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="skill-loadout">
      {renderSelect(0)}
      {renderSelect(1)}
      <p className="skill-loadout__auto">
        {t("skills.auto_pool", locale)}: {autoLabel}
      </p>
      {saving && (
        <p className="skill-loadout__status">{t("skills.saving", locale)}</p>
      )}
      {error && <p className="skill-loadout__error">{error}</p>}
    </div>
  );
}
