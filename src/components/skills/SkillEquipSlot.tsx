import { useId, useState } from "react";
import { getSkillById } from "../../engine/skills";
import type { SkillDefinition } from "../../engine/skills/types";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import { t, type Locale } from "../../utils/i18n";
import { GameIcon } from "../ui/icons";
import { SkillIcon } from "./SkillIcon";

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
  isActive: boolean;
  hasPinnedTooltip: boolean;
  busy?: boolean;
  onActivate: () => void;
  onDismissActive?: () => void;
}

export function SkillEquipSlot({
  locale,
  slotIndex,
  skillId,
  canEquip,
  isActive,
  hasPinnedTooltip,
  onActivate,
  onDismissActive,
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
  const visible = !isActive && hovered && !hasPinnedTooltip;
  const interactive = isEquipped || canEquip;

  useDismissOnOutside(
    hovered && !hasPinnedTooltip,
    () => setHovered(false),
    [".skill-equip-slot-wrap"]
  );

  useDismissOnOutside(
    isActive,
    () => onDismissActive?.(),
    [".skill-equip-slot-wrap", ".skill-equip-picker-panel"]
  );

  return (
    <div
      className="skill-equip-slot-wrap"
      style={{ gridColumn: slotIndex + 1, gridRow: 1 }}
    >
      <button
        type="button"
        className={[
          "char-equip-slot",
          "skill-equip-slot",
          isActive ? "char-equip-slot--active skill-equip-slot--picking" : "",
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
            <SkillIcon
              skill={skill}
              size={34}
              height={38}
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
          className={["char-equip-tooltip", "skill-equip-tooltip"]
            .filter(Boolean)
            .join(" ")}
          role="tooltip"
        >
          <p className="char-equip-tooltip__name">{skillName || slotLabel}</p>
          {!isEquipped && (
            <p className="char-equip-tooltip__empty">
              {t("skills.equip_empty", locale)}
            </p>
          )}
          {isEquipped && skill && (
            <p className="skill-equip-tooltip__meta tabular-nums">
              {formatSkillMeta(skill, locale)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
