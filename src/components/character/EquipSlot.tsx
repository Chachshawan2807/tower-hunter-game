import { useId, useState } from "react";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import {
  formatStatBonus,
  isEquipmentSlotEquipped,
  resolveLoadoutPieceStatBonus,
} from "../../engine/art/equipment";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { InventoryBagEntry } from "../../engine/art/equipment/slotInventory";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { SkillPath } from "../../engine/types";
import { EquipmentItemIcon } from "../items/EquipmentItemIcon";
import { EquipSlotPicker } from "./EquipSlotPicker";
import { t, type Locale } from "../../utils/i18n";
import { SLOT_ICON, SLOT_LABEL, resolveSlotGearName } from "./equipSlotMeta";

export interface EquipSlotProps {
  locale: Locale;
  slot: EquipmentSlot;
  equipment: CharacterEquipmentVisual;
  side: "left" | "right";
  isActive: boolean;
  hasPinnedTooltip: boolean;
  skillPath: SkillPath;
  slotBagItems?: InventoryBagEntry[];
  inventoryLoading?: boolean;
  equipBusy?: boolean;
  unequipBusy?: boolean;
  onActivate: () => void;
  onDismissActive?: () => void;
  onUnequip?: (slot: EquipmentSlot) => void;
  onEquipFromBag?: (inventoryId: string) => void;
}

export function EquipSlot({
  locale,
  slot,
  equipment,
  side,
  isActive,
  hasPinnedTooltip,
  skillPath,
  slotBagItems = [],
  inventoryLoading = false,
  equipBusy = false,
  unequipBusy = false,
  onActivate,
  onDismissActive,
  onUnequip,
  onEquipFromBag,
}: EquipSlotProps) {
  const [hovered, setHovered] = useState(false);
  const tooltipId = useId();

  const isEquipped = isEquipmentSlotEquipped(equipment, slot);
  const gearId = equipment.gearIds[slot] ?? "";
  const rarity = equipment.pieceRarity[slot] ?? "common";
  const slotName = t(SLOT_LABEL[slot], locale);
  const gearName = resolveSlotGearName(equipment, slot, locale);
  const label = `${slotName}: ${gearName}`;
  const bonusLines = isEquipped
    ? formatStatBonus(resolveLoadoutPieceStatBonus(gearId, slot, rarity))
    : [];
  const visible = isActive || (hovered && !hasPinnedTooltip);
  const showUnequip = isActive && isEquipped && Boolean(onUnequip);
  const showPicker = isActive && !isEquipped && Boolean(onEquipFromBag);
  const showActions = showUnequip || showPicker;

  useDismissOnOutside(
    hovered && !hasPinnedTooltip,
    () => setHovered(false),
    [".char-equip-slot-wrap"]
  );

  useDismissOnOutside(
    isActive,
    () => onDismissActive?.(),
    [".char-equip-slot-wrap"]
  );

  return (
    <div className={`char-equip-slot-wrap char-equip-slot-wrap--${side}`}>
      <button
        type="button"
        className={[
          "char-equip-slot",
          isActive ? "char-equip-slot--active" : "",
          !isEquipped ? "char-equip-slot--empty" : "char-equip-slot--equipped",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={label}
        aria-describedby={visible ? tooltipId : undefined}
        aria-expanded={isActive}
        onClick={(e) => {
          e.stopPropagation();
          onActivate();
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <span className="char-equip-slot__icon-stack" aria-hidden>
          {!isEquipped ? (
            <>
              <img
                className="char-equip-slot__icon char-equip-slot__icon--shade"
                src={`/icons/ui/${SLOT_ICON[slot]}.svg`}
                width={26}
                height={26}
                alt=""
                draggable={false}
              />
              <img
                className="char-equip-slot__icon"
                src={`/icons/ui/${SLOT_ICON[slot]}.svg`}
                width={26}
                height={26}
                alt=""
                draggable={false}
              />
            </>
          ) : (
            <EquipmentItemIcon
              gearId={gearId}
              size={26}
              className="char-equip-slot__item-icon"
            />
          )}
        </span>
      </button>

      {visible && (
        <div
          id={tooltipId}
          className={[
            "char-equip-tooltip",
            showActions ? "char-equip-tooltip--actions" : "",
            showPicker ? "char-equip-tooltip--picker" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role="tooltip"
        >
          <p className="char-equip-tooltip__name">
            {showPicker ? slotName : gearName}
          </p>
          {!isEquipped && !showPicker && (
            <p className="char-equip-tooltip__empty">{slotName}</p>
          )}
          {isEquipped && bonusLines.length > 0 && (
            <ul className="char-equip-tooltip__stats">
              {bonusLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          {showPicker && (
            <EquipSlotPicker
              locale={locale}
              slot={slot}
              skillPath={skillPath}
              items={slotBagItems}
              loading={inventoryLoading}
              busy={equipBusy}
              onEquip={(inventoryId) => onEquipFromBag?.(inventoryId)}
            />
          )}
          {showUnequip && (
            <button
              type="button"
              className="char-equip-tooltip__unequip"
              disabled={unequipBusy}
              onClick={(e) => {
                e.stopPropagation();
                onUnequip?.(slot);
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
