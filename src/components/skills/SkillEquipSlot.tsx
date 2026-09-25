import { useId, useRef, useState } from "react";
import { getSkillById, isPassiveSkillType } from "../../engine/skills";
import type { SkillDefinition } from "../../engine/skills/types";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import { t, type Locale } from "../../utils/i18n";
import { formatSkillEquipTooltipLines } from "./skillDetailStats";
import { PassiveSkillSpinFrame } from "./PassiveSkillSpinFrame";
import { SkillIcon } from "./SkillIcon";

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
  onShowDetail?: (skill: SkillDefinition) => void;
}

const LONG_PRESS_MS = 450;

export function SkillEquipSlot({
  locale,
  slotIndex,
  skillId,
  canEquip,
  isActive,
  hasPinnedTooltip,
  onActivate,
  onDismissActive,
  onShowDetail,
}: SkillEquipSlotProps) {
  const [hovered, setHovered] = useState(false);
  const tooltipId = useId();
  const longPressFiredRef = useRef(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPressTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const showEquippedDetail = (equippedSkill: SkillDefinition) => {
    onShowDetail?.(equippedSkill);
  };

  const isEquipped = Boolean(skillId);
  const skill = skillId ? getSkillById(skillId) : null;
  const slotLabel = t("skills.equip_slot_label", locale, {
    slot: String(slotIndex + 1),
  });
  const skillName = skill ? t(skill.stringId, locale) : "";
  const isPassive =
    Boolean(skill?.skillType) && isPassiveSkillType(skill!.skillType!);
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
          isPassive ? "skill-equip-slot--passive" : "",
          !interactive ? "skill-equip-slot--locked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={label}
        aria-describedby={visible ? tooltipId : undefined}
        aria-expanded={isActive}
        disabled={!interactive}
        onContextMenu={(e) => {
          if (isEquipped && skill && onShowDetail) {
            e.preventDefault();
            showEquippedDetail(skill);
          }
        }}
        onPointerDown={(e) => {
          if (!isEquipped || !skill || !onShowDetail || e.button !== 0) return;
          longPressFiredRef.current = false;
          clearPressTimer();
          pressTimerRef.current = setTimeout(() => {
            longPressFiredRef.current = true;
            showEquippedDetail(skill);
          }, LONG_PRESS_MS);
        }}
        onPointerUp={() => clearPressTimer()}
        onPointerCancel={() => clearPressTimer()}
        onPointerLeave={() => clearPressTimer()}
        onClick={(e) => {
          e.stopPropagation();
          if (!interactive) return;
          if (isEquipped && onShowDetail && longPressFiredRef.current) {
            longPressFiredRef.current = false;
            return;
          }
          onActivate();
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        {isPassive ? <PassiveSkillSpinFrame /> : null}
        <span className="char-equip-slot__icon-wrap" aria-hidden>
          {isEquipped && skill ? (
            <span className="char-equip-slot__icon-stack">
              <SkillIcon
                skill={skill}
                size={40}
                height={44}
                className="skill-equip-slot__icon"
              />
            </span>
          ) : null}
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
            <div className="skill-equip-tooltip__meta tabular-nums">
              {formatSkillEquipTooltipLines(skill, locale).map((line, index) => (
                <span
                  key={`${line}-${index}`}
                  className="skill-equip-tooltip__meta-line"
                >
                  {line}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
