import { useId, useState } from "react";
import { getSkillById } from "../../engine/skills";
import type { SkillDefinition } from "../../engine/skills/types";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import { t, type Locale } from "../../utils/i18n";
import { GameIcon, skillIconName } from "../ui/icons";
import { SkillEquipSlotPicker } from "./SkillEquipSlotPicker";

function formatSkillMeta(skill: SkillDefinition, locale: Locale): string {
  const parts = [`MP ${skill.mpCost}`];
  if (skill.cooldownTurns > 0) {
    parts.push(`${t("skills.cooldown", locale)} ${skill.cooldownTurns}`);
  }
  return parts.join(" · ");
}

export interface SkillEquipSlotProps {
  locale: Locale;
  slotIndex: number;
  skillId: string | null;
  canEquip: boolean;
  pickerSkills: SkillDefinition[];
  isActive: boolean;
  hasPinnedTooltip: boolean;
  busy?: boolean;
  onActivate: () => void;
  onDismissActive?: () => void;
  onEquip: (skillId: string) => void;
  onUnequip?: () => void;
}

export function SkillEquipSlot({
  locale,
  slotIndex,
  skillId,
  canEquip,
  pickerSkills,
  isActive,
  hasPinnedTooltip,
  busy = false,
  onActivate,
  onDismissActive,
  onEquip,
  onUnequip,
}: SkillEquipSlotProps) {
  const [hovered, setHovered] = useState(false);
  const tooltipId = useId();

  const isEquipped = Boolean(skillId);
  const skill = skillId ? getSkillById(skillId) : null;
  const slotLabel = t("skills.equip_slot_label", locale, {
    slot: String(slotIndex + 1),
  });
  const skillName = skill ? t(skill.stringId, locale) : "";
  const label = isEquipped ? `${slotLabel}: ${skillName}` : slotLabel;
  const visible = isActive || (hovered && !hasPinnedTooltip);
  const showUnequip = isActive && isEquipped && Boolean(onUnequip);
  const showPicker =
    isActive && (canEquip || isEquipped) && pickerSkills.length > 0;
  const showActions = showUnequip || showPicker;
  const interactive = isEquipped || canEquip;

  useDismissOnOutside(
    hovered && !hasPinnedTooltip,
    () => setHovered(false),
    [".skill-equip-slot-wrap"]
  );

  useDismissOnOutside(
    isActive,
    () => onDismissActive?.(),
    [".skill-equip-slot-wrap"]
  );

  return (
    <div className="skill-equip-slot-wrap">
      <button
        type="button"
        className={[
          "char-equip-slot",
          "skill-equip-slot",
          isActive ? "char-equip-slot--active" : "",
          !isEquipped ? "char-equip-slot--empty" : "char-equip-slot--equipped",
          !interactive ? "skill-equip-slot--locked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={label}
        aria-describedby={visible ? tooltipId : undefined}
        aria-expanded={isActive}
        disabled={!interactive}
        onClick={(e) => {
          e.stopPropagation();
          if (!interactive) return;
          onActivate();
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <span className="char-equip-slot__icon-stack" aria-hidden>
          {isEquipped && skill ? (
            <GameIcon
              name={skillIconName(skill.id)}
              size={26}
              className="skill-equip-slot__icon"
            />
          ) : (
            <>
              <GameIcon
                name="book"
                size={26}
                className="char-equip-slot__icon char-equip-slot__icon--shade"
              />
              <GameIcon
                name="book"
                size={26}
                className="char-equip-slot__icon"
              />
            </>
          )}
        </span>
        <span className="skill-equip-slot__key tabular-nums" aria-hidden>
          {slotIndex + 1}
        </span>
      </button>

      {visible && (
        <div
          id={tooltipId}
          className={[
            "char-equip-tooltip",
            "skill-equip-tooltip",
            showActions ? "char-equip-tooltip--actions" : "",
            showPicker ? "char-equip-tooltip--picker" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role="tooltip"
        >
          <p className="char-equip-tooltip__name">
            {showPicker ? slotLabel : skillName}
          </p>
          {!isEquipped && !showPicker && (
            <p className="char-equip-tooltip__empty">
              {t("skills.equip_empty", locale)}
            </p>
          )}
          {isEquipped && skill && !showPicker && (
            <p className="skill-equip-tooltip__meta tabular-nums">
              {formatSkillMeta(skill, locale)}
            </p>
          )}
          {showPicker && (
            <SkillEquipSlotPicker
              locale={locale}
              skills={pickerSkills}
              busy={busy}
              onEquip={onEquip}
            />
          )}
          {showUnequip && (
            <button
              type="button"
              className="char-equip-tooltip__unequip"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                onUnequip?.();
              }}
            >
              {t("bag.unequip", locale)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
