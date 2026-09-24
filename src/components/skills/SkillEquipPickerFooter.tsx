import {
  canSwapAdjacentEquippedSlot,
  type SkillLoadout,
} from "../../engine/skills/loadout";
import { t, type Locale } from "../../utils/i18n";

interface SkillEquipPickerFooterProps {
  locale: Locale;
  loadout: SkillLoadout;
  activeSlot: number;
  hasEquippedSkill: boolean;
  busy: boolean;
  onSwap: (direction: -1 | 1) => void;
  onUnequip: () => void;
}

export function SkillEquipPickerFooter({
  locale,
  loadout,
  activeSlot,
  hasEquippedSkill,
  busy,
  onSwap,
  onUnequip,
}: SkillEquipPickerFooterProps) {
  if (!hasEquippedSkill) return null;

  const canSwapLeft = canSwapAdjacentEquippedSlot(loadout, activeSlot, -1);
  const canSwapRight = canSwapAdjacentEquippedSlot(loadout, activeSlot, 1);

  return (
    <div className="skill-equip-picker-panel__footer">
      <button
        type="button"
        className="skill-equip-picker-panel__unequip"
        disabled={busy}
        onClick={onUnequip}
      >
        {t("bag.unequip", locale)}
      </button>
      <div className="skill-equip-picker-panel__swap-row">
        <button
          type="button"
          className="skill-equip-picker-panel__swap"
          disabled={busy || !canSwapLeft}
          aria-label={t("skills.equip_swap_left", locale)}
          onClick={() => onSwap(-1)}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          className="skill-equip-picker-panel__swap"
          disabled={busy || !canSwapRight}
          aria-label={t("skills.equip_swap_right", locale)}
          onClick={() => onSwap(1)}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}
