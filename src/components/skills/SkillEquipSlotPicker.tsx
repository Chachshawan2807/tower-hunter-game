import type { SkillDefinition } from "../../engine/skills/types";
import { t, type Locale } from "../../utils/i18n";
import { GameIcon, skillIconName } from "../ui/icons";

interface SkillEquipSlotPickerProps {
  locale: Locale;
  skills: SkillDefinition[];
  busy?: boolean;
  onEquip: (skillId: string) => void;
}

function formatSkillMeta(skill: SkillDefinition, locale: Locale): string {
  const parts = [`MP ${skill.mpCost}`];
  if (skill.cooldownTurns > 0) {
    parts.push(`${t("skills.cooldown", locale)} ${skill.cooldownTurns}`);
  }
  return parts.join(" · ");
}

export function SkillEquipSlotPicker({
  locale,
  skills,
  busy = false,
  onEquip,
}: SkillEquipSlotPickerProps) {
  if (skills.length === 0) {
    return (
      <p className="char-equip-picker__status">
        {t("skills.equip_no_available", locale)}
      </p>
    );
  }

  return (
    <ul
      className="char-equip-picker"
      role="listbox"
      aria-label={t("skills.equip_pick_skill", locale)}
    >
      {skills.map((skill) => {
        const name = t(skill.stringId, locale);
        return (
          <li key={skill.id}>
            <button
              type="button"
              className="char-equip-picker__item"
              role="option"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                onEquip(skill.id);
              }}
            >
              <span className="char-equip-picker__icon" aria-hidden>
                <GameIcon name={skillIconName(skill.id)} size={24} />
              </span>
              <span className="char-equip-picker__main">
                <span className="char-equip-picker__name">{name}</span>
                <span className="char-equip-picker__stat">
                  {formatSkillMeta(skill, locale)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
