import { useCallback, useEffect, useMemo, useState } from "react";
import {
  filterInventoryForEquipmentSlot,
  isEquipmentSlotEquipped,
  type CharacterEquipmentVisual,
} from "../../engine/art/equipment";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { InventoryBagEntry } from "../../engine/art/equipment/slotInventory";
import type { SkillPath } from "../../engine/types";
import { api, type InventoryItem } from "../../utils/api";
import { t, type Locale } from "../../utils/i18n";
import { CharacterFigure } from "./CharacterFigure";
import { EquipSlot } from "./EquipSlot";

const LEFT_SLOTS: EquipmentSlot[] = ["helm", "chest", "boots"];
const RIGHT_SLOTS: EquipmentSlot[] = ["weapon", "gloves", "cloak"];

function toBagEntries(items: InventoryItem[]): InventoryBagEntry[] {
  return items.map((item) => ({
    inventoryId: item.id,
    itemId: item.item_id,
    rarity: item.rarity,
  }));
}

function SlotRail({
  locale,
  slots,
  equipment,
  side,
  activeSlot,
  skillPath,
  inventoryLoading,
  slotBagItems,
  equipBusy,
  unequipBusy,
  onSlotActivate,
  onDismissActive,
  onUnequip,
  onEquipFromBag,
}: {
  locale: Locale;
  slots: EquipmentSlot[];
  equipment: CharacterEquipmentVisual;
  side: "left" | "right";
  activeSlot: EquipmentSlot | null;
  skillPath: SkillPath;
  inventoryLoading: boolean;
  slotBagItems: InventoryBagEntry[];
  equipBusy?: boolean;
  unequipBusy?: boolean;
  onSlotActivate: (slot: EquipmentSlot) => void;
  onDismissActive: () => void;
  onUnequip?: (slot: EquipmentSlot) => void;
  onEquipFromBag?: (slot: EquipmentSlot, inventoryId: string) => void;
}) {
  return (
    <div className={`char-equip-rail char-equip-rail--${side}`}>
      {slots.map((slot) => {
        const isActive = activeSlot === slot;
        const isEmpty = !isEquipmentSlotEquipped(equipment, slot);

        return (
          <EquipSlot
            key={slot}
            locale={locale}
            slot={slot}
            equipment={equipment}
            side={side}
            isActive={isActive}
            hasPinnedTooltip={activeSlot !== null}
            skillPath={skillPath}
            slotBagItems={isActive && isEmpty ? slotBagItems : []}
            inventoryLoading={isActive && isEmpty ? inventoryLoading : false}
            equipBusy={equipBusy}
            unequipBusy={unequipBusy}
            onActivate={() => onSlotActivate(slot)}
            onDismissActive={onDismissActive}
            onUnequip={onUnequip}
            onEquipFromBag={
              onEquipFromBag
                ? (inventoryId) => onEquipFromBag(slot, inventoryId)
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

interface CharacterEquipmentPanelProps {
  locale: Locale;
  userId: string | null;
  skillPath: SkillPath;
  equipment: CharacterEquipmentVisual;
  displayName: string;
  equipBusy?: boolean;
  unequipBusy?: boolean;
  onEquipFromBag?: (slot: EquipmentSlot, inventoryId: string) => Promise<boolean>;
  onUnequip?: (slot: EquipmentSlot) => Promise<boolean>;
}

export function CharacterEquipmentPanel({
  locale,
  userId,
  skillPath,
  equipment,
  displayName,
  equipBusy = false,
  unequipBusy = false,
  onEquipFromBag,
  onUnequip,
}: CharacterEquipmentPanelProps) {
  const [activeSlot, setActiveSlot] = useState<EquipmentSlot | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const reloadInventory = useCallback(async () => {
    if (!userId) {
      setInventory([]);
      return;
    }
    setInventoryLoading(true);
    try {
      const inv = await api.getInventory(userId);
      setInventory(inv.items);
    } catch {
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reloadInventory();
  }, [reloadInventory]);

  useEffect(() => {
    if (!activeSlot || isEquipmentSlotEquipped(equipment, activeSlot)) return;
    void reloadInventory();
  }, [activeSlot, equipment, reloadInventory]);

  const handleSlotActivate = (slot: EquipmentSlot) => {
    setActiveSlot((current) => (current === slot ? null : slot));
  };

  const handleUnequip = (slot: EquipmentSlot) => {
    if (!onUnequip) return;
    void onUnequip(slot).then((ok) => {
      if (ok) setActiveSlot(null);
    });
  };

  const handleEquipFromBag = (slot: EquipmentSlot, inventoryId: string) => {
    if (!onEquipFromBag) return;
    void onEquipFromBag(slot, inventoryId).then(async (ok) => {
      if (ok) {
        setActiveSlot(null);
        await reloadInventory();
      }
    });
  };

  const bagEntries = useMemo(() => toBagEntries(inventory), [inventory]);

  const activeSlotBagItems = useMemo(() => {
    if (!activeSlot) return [];
    return filterInventoryForEquipmentSlot(bagEntries, activeSlot, skillPath);
  }, [activeSlot, bagEntries, skillPath]);

  const railProps = {
    locale,
    equipment,
    activeSlot,
    skillPath,
    inventoryLoading,
    slotBagItems: activeSlotBagItems,
    equipBusy,
    unequipBusy,
    onSlotActivate: handleSlotActivate,
    onDismissActive: () => setActiveSlot(null),
    onUnequip: onUnequip ? handleUnequip : undefined,
    onEquipFromBag: onEquipFromBag ? handleEquipFromBag : undefined,
  };

  return (
    <div
      className="char-equip-doll"
      aria-label={t("char.equipment", locale)}
    >
      <SlotRail slots={LEFT_SLOTS} side="left" {...railProps} />

      <div className="char-equip-stage">
        <div className="char-equip-stage__ring" aria-hidden="true" />
        <CharacterFigure
          equipment={equipment}
          path={equipment.path}
          side="player"
          animState="idle"
          size="menu"
          label={displayName}
        />
      </div>

      <SlotRail slots={RIGHT_SLOTS} side="right" {...railProps} />
    </div>
  );
}
