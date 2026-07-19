import { useEffect, useState } from "react";
import type { SkillPath } from "../../engine/types";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import { t, type Locale } from "../../utils/i18n";
import { api, type InventoryItem, type MailboxItem } from "../../utils/api";
import { GameIcon } from "../ui/icons";
import { BagItemDetail, BagItemSlot } from "./BagItemSlot";

interface BagMenuProps {
  locale: Locale;
  userId: string | null;
  skillPath: SkillPath;
  onEquip: (slot: EquipmentSlot, inventoryId: string) => Promise<boolean>;
  equipBusy?: boolean;
  equipMessage?: string | null;
}

type BagTab = "inventory" | "mailbox";

type BagListItem = InventoryItem | MailboxItem;

function isMailboxItem(item: BagListItem): item is MailboxItem {
  return "expires_at" in item;
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [claimBusy, setClaimBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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
    if (ok) {
      setSelectedId(null);
      await reload();
    }
    return ok;
  };

  const handleClaim = async (mailboxId: string): Promise<boolean> => {
    if (!userId || claimBusy) return false;

    setClaimBusy(true);
    setActionMessage(null);
    try {
      await api.claimMailboxItem(userId, mailboxId);
      setActionMessage(t("bag.claimed", locale));
      setSelectedId(null);
      await reload();
      return true;
    } catch {
      return false;
    } finally {
      setClaimBusy(false);
    }
  };

  const handleTabChange = (next: BagTab) => {
    setTab(next);
    setSelectedId(null);
    setActionMessage(null);
  };

  if (!userId) {
    return <p className="menu-empty">{t("bag.empty", locale)}</p>;
  }

  if (loading) {
    return <p className="menu-empty">...</p>;
  }

  const activeItems: BagListItem[] = tab === "inventory" ? inventory : mailbox;
  const selectedItem = activeItems.find((item) => item.id === selectedId) ?? null;
  const statusMessage = actionMessage ?? equipMessage;
  const actionBusy = tab === "mailbox" ? claimBusy : equipBusy;

  return (
    <div className="bag-menu">
      <div className="bag-tabs">
        <button
          className={`bag-tab ${tab === "inventory" ? "bag-tab--active" : ""}`}
          onClick={() => handleTabChange("inventory")}
        >
          <GameIcon name="bag" size={20} />
          {t("bag.inventory", locale)} ({inventory.length})
        </button>
        <button
          className={`bag-tab ${tab === "mailbox" ? "bag-tab--active" : ""}`}
          onClick={() => handleTabChange("mailbox")}
        >
          <GameIcon name="mailbox" size={20} />
          {t("bag.mailbox", locale)} ({mailbox.length})
        </button>
      </div>

      {tab === "inventory" && (
        <label className="bag-toggle">
          <input
            type="checkbox"
            checked={autoDismantle}
            onChange={toggleAutoDismantle}
          />
          <span>{t("bag.auto_dismantle", locale)}</span>
        </label>
      )}

      {statusMessage && (
        <p className="bag-equip-message" role="status">
          {statusMessage}
        </p>
      )}

      {activeItems.length === 0 ? (
        <p className="menu-empty">
          {t(tab === "mailbox" ? "bag.mailbox_empty" : "bag.empty", locale)}
        </p>
      ) : (
        <>
          <ul className="bag-slot-grid" role="list">
            {activeItems.map((item) => (
              <li key={item.id} className="bag-slot-grid__cell">
                <BagItemSlot
                  id={item.id}
                  itemId={item.item_id}
                  quantity={item.quantity}
                  rarity={item.rarity}
                  expiresAt={isMailboxItem(item) ? item.expires_at : undefined}
                  locale={locale}
                  skillPath={skillPath}
                  selected={selectedId === item.id}
                  onSelect={setSelectedId}
                />
              </li>
            ))}
          </ul>

          {selectedItem && (
            <BagItemDetail
              id={selectedItem.id}
              itemId={selectedItem.item_id}
              quantity={selectedItem.quantity}
              rarity={selectedItem.rarity}
              expiresAt={
                isMailboxItem(selectedItem) ? selectedItem.expires_at : undefined
              }
              locale={locale}
              skillPath={skillPath}
              mode={tab}
              onEquip={handleEquip}
              onClaim={tab === "mailbox" ? handleClaim : undefined}
              actionBusy={actionBusy}
            />
          )}
        </>
      )}
    </div>
  );
}
