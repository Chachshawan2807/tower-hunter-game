import { WeaponIcon } from "../items/WeaponIcon";
import { resolveItemWeaponVisual } from "../../engine/art";
import { resolveEquippableItem } from "../../engine/art/equipment";
import type { SkillPath } from "../../engine/types";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import { t, type Locale } from "../../utils/i18n";
import { abbreviateItemLabel, resolveItemLabel } from "../../utils/itemLabel";

const RARITY_CLASS: Record<string, string> = {
  common: "bag-item-slot--common",
  rare: "bag-item-slot--rare",
  epic: "bag-item-slot--epic",
  legendary: "bag-item-slot--legendary",
};

const RARITY_SHORT: Record<string, string> = {
  common: "bag.rarity_short.common",
  rare: "bag.rarity_short.rare",
  epic: "bag.rarity_short.epic",
  legendary: "bag.rarity_short.legendary",
};

export interface BagItemSlotProps {
  id: string;
  itemId: string;
  quantity: number;
  rarity: string;
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
  rarity,
  expiresAt,
  locale,
  skillPath,
  selected,
  onSelect,
}: BagItemSlotProps) {
  const rarityClass = RARITY_CLASS[rarity] ?? RARITY_CLASS.common;
  const weaponVisual = resolveItemWeaponVisual(itemId);
  const displayName = resolveItemLabel(itemId, locale, skillPath);
  const shortName = abbreviateItemLabel(displayName, locale === "th" ? 5 : 7);
  const rarityKey = RARITY_SHORT[rarity] ?? RARITY_SHORT.common;
  const equippable = resolveEquippableItem(itemId, skillPath);

  return (
    <button
      type="button"
      className={[
        "bag-item-slot",
        rarityClass,
        selected ? "bag-item-slot--selected" : "",
      ].join(" ")}
      aria-label={displayName}
      aria-pressed={selected}
      onClick={() => onSelect(id)}
    >
      <span className="bag-item-slot__icon" aria-hidden>
        <WeaponIcon
          weaponId={weaponVisual.weaponId}
          rarity={weaponVisual.rarity}
          size={32}
          className="bag-item-slot__weapon-icon"
        />
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
        <span className="bag-item-slot__rarity">{t(rarityKey, locale)}</span>
      </span>
    </button>
  );
}

export interface BagItemDetailProps {
  id: string;
  itemId: string;
  quantity: number;
  rarity: string;
  expiresAt?: string;
  locale: Locale;
  skillPath: SkillPath;
  mode: "inventory" | "mailbox";
  onEquip: (slot: EquipmentSlot, inventoryId: string) => Promise<boolean>;
  onClaim?: (mailboxId: string) => Promise<boolean>;
  actionBusy?: boolean;
}

export function BagItemDetail({
  id,
  itemId,
  quantity,
  rarity,
  expiresAt,
  locale,
  skillPath,
  mode,
  onEquip,
  onClaim,
  actionBusy,
}: BagItemDetailProps) {
  const displayName = resolveItemLabel(itemId, locale, skillPath);
  const equippable = resolveEquippableItem(itemId, skillPath);
  const rarityKey = RARITY_SHORT[rarity] ?? RARITY_SHORT.common;
  const showEquip = mode === "inventory" && equippable && !expiresAt;
  const showClaim = mode === "mailbox" && onClaim;

  return (
    <div className="bag-slot-detail" role="region" aria-label={displayName}>
      <div className="bag-slot-detail__main">
        <p className="bag-slot-detail__name">{displayName}</p>
        <p className="bag-slot-detail__stats">
          <span className="bag-slot-detail__rarity">{t(rarityKey, locale)}</span>
          <span className="bag-slot-detail__sep" aria-hidden>
            ·
          </span>
          <span className="bag-slot-detail__qty">×{quantity}</span>
          {expiresAt && (
            <>
              <span className="bag-slot-detail__sep" aria-hidden>
                ·
              </span>
              <span className="bag-slot-detail__expiry">
                {t("bag.expires", locale)}:{" "}
                {new Date(expiresAt).toLocaleDateString()}
              </span>
            </>
          )}
        </p>
      </div>
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
  );
}
