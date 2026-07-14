import { useEffect, useState } from "react";
import {
  resolveEquippableItem,
} from "../../engine/art/equipment";
import { WeaponIcon } from "../items/WeaponIcon";
import { resolveItemWeaponVisual } from "../../engine/art";
import type { SkillPath } from "../../engine/types";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import { t, type Locale } from "../../utils/i18n";
import { resolveItemLabel } from "../../utils/itemLabel";
import { api, type InventoryItem, type MailboxItem } from "../../utils/api";
import { GameIcon } from "../ui/icons";

interface BagMenuProps {
  locale: Locale;
  userId: string | null;
  skillPath: SkillPath;
  onEquip: (slot: EquipmentSlot, inventoryId: string) => Promise<boolean>;
  equipBusy?: boolean;
  equipMessage?: string | null;
}

type BagTab = "inventory" | "mailbox";

const RARITY_CLASS: Record<string, string> = {
  common: "bag-item--common",
  rare: "bag-item--rare",
  epic: "bag-item--epic",
  legendary: "bag-item--legendary",
};

function ItemRow({
  id,
  itemId,
  quantity,
  rarity,
  expiresAt,
  locale,
  skillPath,
  onEquip,
  equipBusy,
}: {
  id: string;
  itemId: string;
  quantity: number;
  rarity: string;
  expiresAt?: string;
  locale: Locale;
  skillPath: SkillPath;
  onEquip: (slot: EquipmentSlot, inventoryId: string) => Promise<boolean>;
  equipBusy?: boolean;
}) {
  const rarityClass = RARITY_CLASS[rarity] ?? RARITY_CLASS.common;
  const weaponVisual = resolveItemWeaponVisual(itemId);
  const equippable = resolveEquippableItem(itemId, skillPath);
  const displayName = resolveItemLabel(itemId, locale, skillPath);

  return (
    <li className={`bag-item ui-row ${rarityClass}`}>
      <div className="ui-row__icon">
        <WeaponIcon
          weaponId={weaponVisual.weaponId}
          rarity={weaponVisual.rarity}
          size={40}
          className="bag-item__weapon-icon"
        />
      </div>
      <div className="ui-row__main">
        <div className="bag-item__main">
          <span className="bag-item__name">{displayName}</span>
          <span className="bag-item__qty">×{quantity}</span>
        </div>
        <span className="bag-item__rarity">{rarity}</span>
        {expiresAt && (
          <span className="bag-item__expiry">
            {t("bag.expires", locale)}: {new Date(expiresAt).toLocaleDateString()}
          </span>
        )}
      </div>
      {equippable && !expiresAt ? (
        <div className="ui-row__action">
          <button
            type="button"
            className="bag-item__equip-btn"
            disabled={equipBusy}
            onClick={() => onEquip(equippable.slot, id)}
          >
            {t("bag.equip", locale)}
          </button>
        </div>
      ) : (
        <div className="ui-row__action" aria-hidden="true" />
      )}
    </li>
  );
}

export function BagMenu({
  locale,
  userId,
  skillPath,
  onEquip,
  equipBusy,
  equipMessage,
}: BagMenuProps) {
  const [tab, setTab] = useState<BagTab>("inventory");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [mailbox, setMailbox] = useState<MailboxItem[]>([]);
  const [autoDismantle, setAutoDismantle] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [inv, mail, user] = await Promise.all([
        api.getInventory(userId),
        api.getMailbox(userId),
        api.getUser(userId).catch(() => null),
      ]);
      setInventory(inv.items);
      setMailbox(mail.items);
      if (user) {
        setAutoDismantle(user.auto_dismantle_common ?? false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [userId]);

  const toggleAutoDismantle = async () => {
    if (!userId) return;
    const next = !autoDismantle;
    await api.updateSettings(userId, { autoDismantleCommon: next });
    setAutoDismantle(next);
  };

  const handleEquip = async (slot: EquipmentSlot, inventoryId: string): Promise<boolean> => {
    const ok = await onEquip(slot, inventoryId);
    if (ok) await reload();
    return ok;
  };

  if (!userId) {
    return <p className="menu-empty">{t("bag.empty", locale)}</p>;
  }

  if (loading) {
    return <p className="menu-empty">...</p>;
  }

  const activeItems = tab === "inventory" ? inventory : mailbox;

  return (
    <div className="bag-menu">
      <div className="bag-tabs">
        <button
          className={`bag-tab ${tab === "inventory" ? "bag-tab--active" : ""}`}
          onClick={() => setTab("inventory")}
        >
          <GameIcon name="bag" size={20} />
          {t("bag.inventory", locale)} ({inventory.length})
        </button>
        <button
          className={`bag-tab ${tab === "mailbox" ? "bag-tab--active" : ""}`}
          onClick={() => setTab("mailbox")}
        >
          <GameIcon name="mailbox" size={20} />
          {t("bag.mailbox", locale)} ({mailbox.length})
        </button>
      </div>

      <label className="bag-toggle">
        <input
          type="checkbox"
          checked={autoDismantle}
          onChange={toggleAutoDismantle}
        />
        <span>{t("bag.auto_dismantle", locale)}</span>
      </label>

      {equipMessage && (
        <p className="bag-equip-message" role="status">
          {equipMessage}
        </p>
      )}

      {activeItems.length === 0 ? (
        <p className="menu-empty">{t("bag.empty", locale)}</p>
      ) : (
        <ul className="bag-list">
          {tab === "inventory"
            ? inventory.map((item) => (
                <ItemRow
                  key={item.id}
                  id={item.id}
                  itemId={item.item_id}
                  quantity={item.quantity}
                  rarity={item.rarity}
                  locale={locale}
                  skillPath={skillPath}
                  onEquip={handleEquip}
                  equipBusy={equipBusy}
                />
              ))
            : mailbox.map((item) => (
                <ItemRow
                  key={item.id}
                  id={item.id}
                  itemId={item.item_id}
                  quantity={item.quantity}
                  rarity={item.rarity}
                  expiresAt={item.expires_at}
                  locale={locale}
                  skillPath={skillPath}
                  onEquip={handleEquip}
                  equipBusy={equipBusy}
                />
              ))}
        </ul>
      )}
    </div>
  );
}
