import {
  formatStatBonus,
  resolveLoadoutPieceStatBonus,
} from "../../engine/art/equipment";
import type { InventoryBagEntry } from "../../engine/art/equipment/slotInventory";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { ItemRarityVisual } from "../../engine/art/weaponTypes";
import type { SkillPath } from "../../engine/types";
import { resolveItemLabel } from "../../utils/itemLabel";
import { t, type Locale } from "../../utils/i18n";
import { EquipmentItemIcon } from "../items/EquipmentItemIcon";

interface EquipSlotPickerProps {
  locale: Locale;
  slot: EquipmentSlot;
  skillPath: SkillPath;
  items: InventoryBagEntry[];
  loading?: boolean;
  busy?: boolean;
  onEquip: (inventoryId: string) => void;
}

export function EquipSlotPicker({
  locale,
  slot,
  skillPath,
  items,
  loading = false,
  busy = false,
  onEquip,
}: EquipSlotPickerProps) {
  if (loading) {
    return <p className="char-equip-picker__status">...</p>;
  }

  if (items.length === 0) {
    return (
      <p className="char-equip-picker__status">
        {t("char.slot.no_items", locale)}
      </p>
    );
  }

  return (
    <ul className="char-equip-picker" role="listbox" aria-label={t("char.slot.pick_item", locale)}>
      {items.map((item) => {
        const name = resolveItemLabel(item.itemId, locale, skillPath);
        const statLines = formatStatBonus(
          resolveLoadoutPieceStatBonus(
            item.itemId,
            slot,
            item.rarity as ItemRarityVisual
          )
        );

        return (
          <li key={item.inventoryId}>
            <button
              type="button"
              className="char-equip-picker__item"
              role="option"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                onEquip(item.inventoryId);
              }}
            >
              <span className="char-equip-picker__icon" aria-hidden>
                <EquipmentItemIcon gearId={item.itemId} size={24} />
              </span>
              <span className="char-equip-picker__main">
                <span className="char-equip-picker__name">{name}</span>
                {statLines[0] ? (
                  <span className="char-equip-picker__stat">{statLines[0]}</span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
