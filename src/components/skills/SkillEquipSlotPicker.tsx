import type { SkillDefinition } from "../../engine/skills/types";
import { t, type Locale } from "../../utils/i18n";
import { SkillIconTile } from "./SkillIconTile";

interface SkillEquipSlotPickerProps {
  locale: Locale;
  skills: SkillDefinition[];
  busy?: boolean;
  onSkillSelect: (skill: SkillDefinition) => void;
}

export function SkillEquipSlotPicker({
  locale,
  skills,
  busy = false,
  onSkillSelect,
}: SkillEquipSlotPickerProps) {
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
      role="listbox"
      aria-label={t("skills.equip_pick_skill", locale)}
    >
      {skills.map((skill) => {
        const name = t(skill.stringId, locale);
        return (
          <SkillIconTile
            key={skill.id}
            skill={skill}
            label={name}
            size={32}
            disabled={busy}
            className="char-equip-picker__tile"
            onClick={() => onSkillSelect(skill)}
          />
        );
      })}
    </div>
  );
}
