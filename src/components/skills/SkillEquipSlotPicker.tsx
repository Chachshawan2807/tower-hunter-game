import type { CSSProperties } from "react";
import type { SkillDefinition } from "../../engine/skills/types";
import { t, type Locale } from "../../utils/i18n";
import { SkillIconTile } from "./SkillIconTile";

interface SkillEquipSlotPickerProps {
  locale: Locale;
  skills: SkillDefinition[];
  columnCount?: number;
  busy?: boolean;
  onSkillSelect: (skill: SkillDefinition) => void;
}

export function SkillEquipSlotPicker({
  locale,
  skills,
  columnCount,
  busy = false,
  onSkillSelect,
}: SkillEquipSlotPickerProps) {
  const cols = columnCount ?? Math.min(4, Math.max(1, skills.length));
  if (skills.length === 0) {
    return (
      <p className="char-equip-picker__status">
        {t("skills.equip_no_available", locale)}
      </p>
    );
  }

  return (
    <div
      className="char-equip-picker char-equip-picker--icons"
      style={
        {
          ["--skill-equip-picker-cols" as string]: String(cols),
        } as CSSProperties
      }
      role="listbox"
      aria-label={t("skills.equip_action", locale)}
    >
      {skills.map((skill) => {
        const name = t(skill.stringId, locale);
        return (
          <SkillIconTile
            key={skill.id}
            skill={skill}
            label={name}
            showName={false}
            disabled={busy}
            className="char-equip-picker__tile"
            onClick={() => onSkillSelect(skill)}
          />
        );
      })}
    </div>
  );
}
