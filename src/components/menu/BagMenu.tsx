import { useEffect, useState } from "react";
import type { SkillPath } from "../../engine/types";
import type { ItemRarityVisual } from "../../engine/art/weaponTypes";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import { useDismissOnOutside } from "../../hooks/useDismissOnOutside";
import { resolveShopItemSellPrice } from "../../engine/shop/sellPrice";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { t, type Locale } from "../../utils/i18n";
import { api, type InventoryItem } from "../../utils/api";
import { formatDialogMessage } from "../../utils/formatDialogMessage";
import { formatGoldAmount } from "../../utils/formatGold";
import { resolveItemLabel } from "../../utils/itemLabel";
import { BagItemDetail } from "./BagItemDetail";
import { BagItemSlot } from "./BagItemSlot";

interface BagMenuProps {
  locale: Locale;
  userId: string | null;
  skillPath: SkillPath;
  equipment: CharacterEquipmentVisual;
  onEquip: (slot: EquipmentSlot, inventoryId: string) => Promise<boolean>;
  onSellComplete?: (balanceAfter: string) => void;
  equipBusy?: boolean;
  equipMessage?: string | null;
}

export function BagMenu({
  locale,
  userId,
  skillPath,
  equipment,
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
  const [pendingSellId, setPendingSellId] = useState<string | null>(null);

  useDismissOnOutside(
    selectedId !== null && !pendingSellId,
    () => setSelectedId(null),
    [".bag-item-slot", ".bag-slot-detail"]
  );

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
      const result = await api.sellShopItem(userId, inventoryId, crypto.randomUUID());
      setMessage(t("bag.sold", locale));
      setSelectedId(null);
      setPendingSellId(null);
      await reload();
      onSellComplete?.(result.balanceAfter);
      return true;
    } catch {
      setMessage(t("bag.sell_error", locale));
      return false;
    } finally {
      setSellBusy(false);
    }
  };

  const confirmSell = () => {
    if (!pendingSellId) return;
    const inventoryId = pendingSellId;
    void handleSell(inventoryId);
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
  const pendingSellItem =
    inventory.find((item) => item.id === pendingSellId) ?? null;
  const equippedGearIds = new Set(
    Object.values(equipment.gearIds).filter((gearId): gearId is string => Boolean(gearId))
  );

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
                  isEquipped={equippedGearIds.has(item.item_id)}
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
                rarity={selectedItem.rarity as ItemRarityVisual}
                locale={locale}
                skillPath={skillPath}
                mode="inventory"
                isEquipped={equippedGearIds.has(selectedItem.item_id)}
                onEquip={handleEquip}
                onSellRequest={setPendingSellId}
                actionBusy={actionBusy}
              />
            </div>
          )}
        </>
      )}

      {pendingSellItem && (
        <ConfirmDialog
          locale={locale}
          title={t("bag.confirm_sell_title", locale)}
          message={formatDialogMessage("bag.confirm_sell_message", locale, {
            item: resolveItemLabel(pendingSellItem.item_id, locale, skillPath),
            price: formatGoldAmount(
              resolveShopItemSellPrice(pendingSellItem.item_id) ?? 0n
            ),
          })}
          confirmLabel={t("bag.sell", locale)}
          busy={sellBusy}
          onConfirm={confirmSell}
          onCancel={() => setPendingSellId(null)}
        />
      )}
    </div>
  );
}
