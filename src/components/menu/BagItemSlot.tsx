import { WeaponIcon } from "../items/WeaponIcon";
import { getEquipmentShopAssetKey } from "../../engine/shop/equipmentShopItems";
import { getShopItemStats } from "../../engine/shop/shopItemStats";
import { isShopEquipItemId } from "../../engine/shop/shopEquip";
import { resolveItemWeaponVisual } from "../../engine/art";
import { formatStatBonus, resolveEquippableItem } from "../../engine/art/equipment";
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
  onSelect,
}: BagItemSlotProps) {
  const weaponVisual = resolveItemWeaponVisual(itemId);
  const displayName = resolveItemLabel(itemId, locale, skillPath);
  const shortName = abbreviateItemLabel(displayName, locale === "th" ? 5 : 7);
  const equippable = resolveEquippableItem(itemId, skillPath);
  const equipAsset = getEquipmentShopAssetKey(itemId);

  return (
    <button
      type="button"
      className={["bag-item-slot", selected ? "bag-item-slot--selected" : ""].join(" ")}
      aria-label={displayName}
      aria-pressed={selected}
      onClick={() => onSelect(id)}
    >
      <span className="bag-item-slot__icon" aria-hidden>
        {equipAsset ? (
          <span
            className="game-icon game-icon--file bag-item-slot__weapon-icon"
            style={{
              width: 32,
              height: 32,
              ["--icon-mask" as string]: `url(/icons/equipment-items/${equipAsset}.svg)`,
            }}
          />
        ) : (
          <WeaponIcon
            weaponId={weaponVisual.weaponId}
            rarity={weaponVisual.rarity}
            size={32}
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
        <span className="bag-item-slot__equip-dot" aria-hidden title={t("bag.equip", locale)} />
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
  expiresAt?: string;
  locale: Locale;
  skillPath: SkillPath;
  mode: "inventory" | "mailbox";
  onEquip: (slot: EquipmentSlot, inventoryId: string) => Promise<boolean>;
  onSell?: (inventoryId: string) => Promise<boolean>;
  onClaim?: (mailboxId: string) => Promise<boolean>;
  actionBusy?: boolean;
}

export function BagItemDetail({
  id,
  itemId,
  quantity,
  expiresAt,
  locale,
  skillPath,
  mode,
  onEquip,
  onSell,
  onClaim,
  actionBusy,
}: BagItemDetailProps) {
  const displayName = resolveItemLabel(itemId, locale, skillPath);
  const equippable = resolveEquippableItem(itemId, skillPath);
  const statLines = isShopEquipItemId(itemId)
    ? formatStatBonus(getShopItemStats(itemId) ?? {})
    : [];
  const showEquip = mode === "inventory" && equippable;
  const showSell = mode === "inventory" && isShopEquipItemId(itemId) && onSell;
  const showClaim = mode === "mailbox" && onClaim;

  return (
    <div className="bag-slot-detail" role="region" aria-label={displayName}>
      <div className="bag-slot-detail__main">
        <p className="bag-slot-detail__name">{displayName}</p>
        {statLines.length > 0 && (
          <ul className="bag-slot-detail__stat-lines">
            {statLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
        <p className="bag-slot-detail__stats">
          <span className="bag-slot-detail__qty">×{quantity}</span>
          {expiresAt && (
            <>
              <span className="bag-slot-detail__sep" aria-hidden>
                ·
              </span>
              <span className="bag-slot-detail__expiry">
                {t("bag.expires", locale)}: {new Date(expiresAt).toLocaleDateString()}
              </span>
            </>
          )}
        </p>
      </div>
      <div className="bag-slot-detail__actions">
        {showEquip ? (
          <button
            type="button"
            className="bag-item__equip-btn"
            disabled={actionBusy}
            onClick={() => onEquip(equippable.slot, id)}
          >
            {t("bag.equip", locale)}
          </button>
        ) : null}
        {showSell ? (
          <button
            type="button"
            className="bag-item__sell-btn"
            disabled={actionBusy}
            onClick={() => onSell(id)}
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
