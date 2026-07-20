import { useEffect, useState } from "react";
import type { SkillPath } from "../../engine/types";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import { t, type Locale } from "../../utils/i18n";
import { api, type InventoryItem } from "../../utils/api";
import { BagItemDetail, BagItemSlot } from "./BagItemSlot";

interface BagMenuProps {
  locale: Locale;
  userId: string | null;
  skillPath: SkillPath;
  onEquip: (slot: EquipmentSlot, inventoryId: string) => Promise<boolean>;
  onSellComplete?: () => void;
  equipBusy?: boolean;
  equipMessage?: string | null;
}

export function BagMenu({
  locale,
  userId,
  skillPath,
  onEquip,
  onSellComplete,
  equipBusy,
  equipMessage,
}: BagMenuProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sellBusy, setSellBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reload = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const inv = await api.getInventory(userId);
      setInventory(inv.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [userId]);

  const handleEquip = async (slot: EquipmentSlot, inventoryId: string): Promise<boolean> => {
    const ok = await onEquip(slot, inventoryId);
    if (ok) {
      setSelectedId(null);
      await reload();
    }
    return ok;
  };

  const handleSell = async (inventoryId: string): Promise<boolean> => {
    if (!userId || sellBusy) return false;
    setSellBusy(true);
    setMessage(null);
    try {
      await api.sellShopItem(userId, inventoryId, crypto.randomUUID());
      setMessage(t("bag.sold", locale));
      setSelectedId(null);
      await reload();
      onSellComplete?.();
      return true;
    } catch {
      setMessage(t("bag.sell_error", locale));
      return false;
    } finally {
      setSellBusy(false);
    }
  };

  const actionBusy = equipBusy || sellBusy;
  const statusMessage = message ?? equipMessage;

  if (!userId) {
    return <p className="menu-empty">{t("bag.empty", locale)}</p>;
  }

  if (loading) {
    return <p className="menu-empty">...</p>;
  }

  const selectedItem = inventory.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="bag-menu">
      {statusMessage && (
        <p className="bag-equip-message" role="status">
          {statusMessage}
        </p>
      )}

      {inventory.length === 0 ? (
        <p className="menu-empty">{t("bag.empty", locale)}</p>
      ) : (
        <>
          <ul className="bag-slot-grid" role="list">
            {inventory.map((item) => (
              <li key={item.id} className="bag-slot-grid__cell">
                <BagItemSlot
                  id={item.id}
                  itemId={item.item_id}
                  quantity={item.quantity}
                  locale={locale}
                  skillPath={skillPath}
                  selected={selectedId === item.id}
                  onSelect={setSelectedId}
                />
              </li>
            ))}
          </ul>

          {selectedItem && (
            <div className="bag-slot-detail-wrap" key={selectedItem.id}>
              <BagItemDetail
                id={selectedItem.id}
                itemId={selectedItem.item_id}
                quantity={selectedItem.quantity}
                locale={locale}
                skillPath={skillPath}
                mode="inventory"
                onEquip={handleEquip}
                onSell={handleSell}
                actionBusy={actionBusy}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
