import type { InventoryBagEntry } from "../../engine/art/equipment/slotInventory";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { SkillPath } from "../../engine/types";
import { t, type Locale } from "../../utils/i18n";
import { EquipSlotPicker } from "./EquipSlotPicker";

interface CharacterEquipPickerFlyoutProps {
  locale: Locale;
  slot: EquipmentSlot;
  skillPath: SkillPath;
  items: InventoryBagEntry[];
  loading?: boolean;
  busy?: boolean;
  onEquip: (inventoryId: string) => void;
}

export function CharacterEquipPickerFlyout({
  locale,
  slot,
  skillPath,
  items,
  loading = false,
  busy = false,
  onEquip,
}: CharacterEquipPickerFlyoutProps) {
  return (
    <div
      className="char-equip-picker-flyout char-equip-tooltip char-equip-tooltip--actions char-equip-tooltip--picker"
      role="dialog"
      aria-label={t("char.slot.pick_item", locale)}
    >
      <EquipSlotPicker
        locale={locale}
        slot={slot}
        skillPath={skillPath}
        items={items}
        loading={loading}
        busy={busy}
        onEquip={onEquip}
      />
    </div>
  );
}
