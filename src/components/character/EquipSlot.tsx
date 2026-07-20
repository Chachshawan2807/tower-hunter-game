import { useId, useState } from "react";
import {
  formatStatBonus,
  GEAR_CATALOG,
  getGearEntry,
  resolveLoadoutPieceStatBonus,
} from "../../engine/art/equipment";
import { getEquipmentShopLabel } from "../../engine/shop/equipmentShopItems";
import { isShopEquipItemId } from "../../engine/shop/shopEquip";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import { t, type Locale } from "../../utils/i18n";

const SLOT_LABEL: Record<EquipmentSlot, string> = {
  weapon: "char.slot.weapon",
  helm: "char.slot.helm",
  chest: "char.slot.chest",
  gloves: "char.slot.gloves",
  boots: "char.slot.boots",
  cloak: "char.slot.cloak",
};

const SLOT_ICON: Record<
  EquipmentSlot,
  "slot-helm" | "slot-chest" | "slot-gloves" | "slot-boots" | "slot-cloak" | "slot-weapon"
> = {
  weapon: "slot-weapon",
  helm: "slot-helm",
  chest: "slot-chest",
  gloves: "slot-gloves",
  boots: "slot-boots",
  cloak: "slot-cloak",
};

function resolveSlotGearName(
  visual: CharacterEquipmentVisual,
  slot: EquipmentSlot,
  locale: Locale
): string {
  const gearId = visual.gearIds[slot] ?? "";
  if (isShopEquipItemId(gearId)) {
    return getEquipmentShopLabel(gearId, locale) ?? gearId;
  }
  if (slot === "weapon") {
    const match = Object.values(GEAR_CATALOG).find(
      (e) => e.slot === "weapon" && e.path === visual.path && e.weaponId === visual.weapon
    );
    const key = match?.nameKey ?? `weapon.${visual.weapon}`;
    return t(key, locale);
  }
  const entry = getGearEntry(visual[slot]);
  return t(entry?.nameKey ?? visual[slot], locale);
}

export interface EquipSlotProps {
  locale: Locale;
  slot: EquipmentSlot;
  equipment: CharacterEquipmentVisual;
  side: "left" | "right";
  isActive: boolean;
  hasPinnedTooltip: boolean;
  onActivate: () => void;
}

export function EquipSlot({
  locale,
  slot,
  equipment,
  side,
  isActive,
  hasPinnedTooltip,
  onActivate,
}: EquipSlotProps) {
  const [hovered, setHovered] = useState(false);
  const tooltipId = useId();

  const gearId = equipment.gearIds[slot] ?? equipment[slot];
  const rarity = equipment.pieceRarity[slot] ?? "common";
  const slotName = t(SLOT_LABEL[slot], locale);
  const gearName = resolveSlotGearName(equipment, slot, locale);
  const label = `${slotName}: ${gearName}`;
  const bonusLines = formatStatBonus(
    resolveLoadoutPieceStatBonus(gearId, slot, rarity)
  );
  const visible = isActive || (hovered && !hasPinnedTooltip);

  return (
    <div className={`char-equip-slot-wrap char-equip-slot-wrap--${side}`}>
      <button
        type="button"
        className={["char-equip-slot", isActive ? "char-equip-slot--active" : ""].join(" ")}
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
        </span>
      </button>

      {visible && (
        <div id={tooltipId} className="char-equip-tooltip" role="tooltip">
          <p className="char-equip-tooltip__name">{gearName}</p>
          {bonusLines.length > 0 && (
            <ul className="char-equip-tooltip__stats">
              {bonusLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
