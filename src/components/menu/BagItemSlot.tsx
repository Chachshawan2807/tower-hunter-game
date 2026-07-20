import { WeaponIcon } from "../items/WeaponIcon";
import { EquipmentItemIcon } from "../items/EquipmentItemIcon";
import { resolveEquipmentIconAsset } from "../../engine/art/equipment/iconAssets";
import { isShopEquipItemId } from "../../engine/shop/shopEquip";
import { resolveItemWeaponVisual } from "../../engine/art";
import {
  formatStatBonus,
  resolveEquippableItem,
  resolveLoadoutPieceStatBonus,
} from "../../engine/art/equipment";
import type { ItemRarityVisual } from "../../engine/art/weaponTypes";
import type { SkillPath } from "../../engine/types";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import { t, type Locale } from "../../utils/i18n";
import { abbreviateItemLabel, resolveItemLabel } from "../../utils/itemLabel";

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
  const equippable = resolveEquippableItem(itemId, skillPath);
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
      aria-label={displayName}
      aria-pressed={selected}
      onClick={() => onSelect(id)}
    >
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
      {equippable && !expiresAt && (
        <span
          className={[
            "bag-item-slot__equip-dot",
            isEquipped ? "bag-item-slot__equip-dot--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
          title={isEquipped ? t("bag.equipped", locale) : t("bag.equip", locale)}
        />
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

export interface BagItemDetailProps {
  id: string;
  itemId: string;
  quantity: number;
  rarity?: ItemRarityVisual;
  expiresAt?: string;
  locale: Locale;
  skillPath: SkillPath;
  mode: "inventory" | "mailbox";
  isEquipped?: boolean;
  onEquip: (slot: EquipmentSlot, inventoryId: string) => Promise<boolean>;
  onSellRequest?: (inventoryId: string) => void;
  onClaim?: (mailboxId: string) => Promise<boolean>;
  actionBusy?: boolean;
}

export function BagItemDetail({
  id,
  itemId,
  quantity,
  rarity = "common",
  expiresAt,
  locale,
  skillPath,
  mode,
  isEquipped,
  onEquip,
  onSellRequest,
  onClaim,
  actionBusy,
}: BagItemDetailProps) {
  const displayName = resolveItemLabel(itemId, locale, skillPath);
  const equippable = resolveEquippableItem(itemId, skillPath);
  const statLines = equippable
    ? formatStatBonus(
        resolveLoadoutPieceStatBonus(itemId, equippable.slot, rarity)
      )
    : [];
  const showEquip = mode === "inventory" && equippable && !isEquipped;
  const showSell = mode === "inventory" && isShopEquipItemId(itemId) && onSellRequest;
  const showClaim = mode === "mailbox" && onClaim;

  return (
    <div
      className="bag-slot-detail"
      role="region"
      aria-label={`${displayName} ×${quantity}`}
    >
      <div className="bag-slot-detail__icon" aria-hidden>
        {resolveEquipmentIconAsset(itemId) ? (
          <EquipmentItemIcon gearId={itemId} size={30} className="bag-slot-detail__item-icon" />
        ) : (
          <WeaponIcon
            weaponId={resolveItemWeaponVisual(itemId).weaponId}
            rarity={rarity}
            size={30}
          />
        )}
      </div>

      <div className="bag-slot-detail__main">
        <div className="bag-slot-detail__title-row">
          <p className="bag-slot-detail__name">{displayName}</p>
        </div>
        {statLines.length > 0 && (
          <ul className="bag-slot-detail__stat-lines">
            {statLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
        {expiresAt && (
          <p className="bag-slot-detail__expiry">
            {t("bag.expires", locale)}: {new Date(expiresAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="bag-slot-detail__actions">
        <span className="bag-slot-detail__qty" aria-hidden>
          ×{quantity}
        </span>
        {showEquip ? (
          <button
            type="button"
            className="bag-item__equip-btn"
            disabled={actionBusy}
            onClick={() => onEquip(equippable.slot, id)}
          >
            {t("bag.equip", locale)}
          </button>
        ) : isEquipped ? (
          <span className="bag-item__equipped-label">{t("bag.equipped", locale)}</span>
        ) : null}
        {showSell ? (
          <button
            type="button"
            className="bag-item__sell-btn"
            disabled={actionBusy}
            onClick={() => onSellRequest(id)}
          >
            {t("bag.sell", locale)}
          </button>
        ) : null}
        {showClaim ? (
          <button
            type="button"
            className="bag-item__claim-btn"
            disabled={actionBusy}
            onClick={() => onClaim(id)}
          >
            {t("bag.claim", locale)}
          </button>
        ) : null}
      </div>
    </div>
  );
}
