import { WeaponIcon } from "../items/WeaponIcon";
import { EquipmentItemIcon } from "../items/EquipmentItemIcon";
import { resolveEquipmentIconAsset } from "../../engine/art/equipment/iconAssets";
import { resolveItemWeaponVisual } from "../../engine/art";
import type { SkillPath } from "../../engine/types";
import { t, type Locale } from "../../utils/i18n";
import { abbreviateItemLabel, resolveItemLabel } from "../../utils/itemLabel";
import { PassiveSkillSpinFrame } from "../skills/PassiveSkillSpinFrame";

export interface BagItemSlotProps {
  id: string;
  itemId: string;
  quantity: number;
  expiresAt?: string;
  locale: Locale;
  skillPath: SkillPath;
  selected?: boolean;
  isEquipped?: boolean;
  onSelect: (id: string) => void;
}

export function BagItemSlot({
  id,
  itemId,
  quantity,
  expiresAt,
  locale,
  skillPath,
  selected,
  isEquipped,
  onSelect,
}: BagItemSlotProps) {
  const weaponVisual = resolveItemWeaponVisual(itemId);
  const displayName = resolveItemLabel(itemId, locale, skillPath);
  const shortName = abbreviateItemLabel(displayName, locale === "th" ? 5 : 7);
  const equipAsset = resolveEquipmentIconAsset(itemId);

  return (
    <button
      type="button"
      className={[
        "bag-item-slot",
        selected ? "bag-item-slot--selected" : "",
        isEquipped ? "bag-item-slot--equipped" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={
        isEquipped
          ? `${displayName} (${t("bag.equipped", locale)})`
          : displayName
      }
      aria-pressed={selected}
      onClick={() => onSelect(id)}
    >
      {isEquipped ? <PassiveSkillSpinFrame /> : null}
      <span className="bag-item-slot__icon" aria-hidden>
        {equipAsset ? (
          <EquipmentItemIcon
            gearId={itemId}
            size={28}
            className="bag-item-slot__weapon-icon"
          />
        ) : (
          <WeaponIcon
            weaponId={weaponVisual.weaponId}
            rarity={weaponVisual.rarity}
            size={28}
            className="bag-item-slot__weapon-icon"
          />
        )}
      </span>
      {quantity > 1 && (
        <span className="bag-item-slot__qty" aria-hidden>
          ×{quantity}
        </span>
      )}
      {expiresAt && (
        <span className="bag-item-slot__expiry-dot" aria-hidden title={t("bag.expires", locale)} />
      )}
      <span className="bag-item-slot__meta">
        <span className="bag-item-slot__name">{shortName}</span>
      </span>
    </button>
  );
}
