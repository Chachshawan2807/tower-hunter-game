import { useCallback, useEffect, useMemo, useState } from "react";
import { mergeEquipmentLoadout, resolveCharacterEquipment } from "../engine/art/equipment";
import { bonusesFromEquipmentLoadout } from "../engine/formulas/equipmentStats";
import type { CharacterEquipmentVisual } from "../engine/art/equipment/catalog";
import type { GearStatBonus } from "../engine/art/equipment/statBonuses";
import type { EquipmentSlot, PlayerEquipmentLoadout } from "../engine/art/equipment/slots";
import type { SkillPath } from "../engine/types";
import { api } from "../utils/api";
import { t, type Locale } from "../utils/i18n";

export function usePlayerEquipment(
  userId: string | null,
  skillPath: SkillPath,
  locale: Locale = "en"
) {
  const [serverSlots, setServerSlots] = useState<Partial<PlayerEquipmentLoadout>>();
  const [statBonus, setStatBonus] = useState<GearStatBonus>({});
  const [loading, setLoading] = useState(false);
  const [equipBusy, setEquipBusy] = useState(false);
  const [equipMessage, setEquipMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await api.getPlayerEquipment(userId);
      setServerSlots(data.slots);
      setStatBonus(data.statBonus ?? {});
    } catch (err) {
      console.error("Failed to load equipment:", err);
      setServerSlots(undefined);
      setStatBonus({});
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh, skillPath]);

  const loadout = useMemo(
    (): PlayerEquipmentLoadout => mergeEquipmentLoadout(skillPath, serverSlots),
    [skillPath, serverSlots]
  );

  const visual = useMemo(
    (): CharacterEquipmentVisual => resolveCharacterEquipment(skillPath, serverSlots),
    [skillPath, serverSlots]
  );

  const equipFromBag = useCallback(
    async (slot: EquipmentSlot, inventoryId: string) => {
      if (!userId || equipBusy) return false;
      setEquipBusy(true);
      setEquipMessage(null);
      try {
        const result = await api.equipFromBag(userId, slot, inventoryId);
        setServerSlots(result.loadout);
        await refresh();
        const bonusText = result.statBonusLines.join(" · ");
        setEquipMessage(
          bonusText
            ? `${t("bag.equipped", locale)} — ${bonusText}`
            : t("bag.equipped", locale)
        );
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Equip failed";
        setEquipMessage(msg);
        return false;
      } finally {
        setEquipBusy(false);
      }
    },
    [userId, equipBusy, refresh, locale]
  );

  const unequipSlot = useCallback(
    async (slot: EquipmentSlot) => {
      if (!userId || equipBusy) return false;
      setEquipBusy(true);
      setEquipMessage(null);
      try {
        const result = await api.unequipSlot(userId, slot);
        setServerSlots(result.loadout);
        setStatBonus(result.statBonus ?? {});
        await refresh();
        setEquipMessage(t("bag.unequipped", locale));
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unequip failed";
        setEquipMessage(msg);
        return false;
      } finally {
        setEquipBusy(false);
      }
    },
    [userId, equipBusy, refresh, locale]
  );

  const computedBonus = useMemo(
    () => bonusesFromEquipmentLoadout(loadout),
    [loadout]
  );

  const clearEquipMessage = useCallback(() => {
    setEquipMessage(null);
  }, []);

  return {
    visual,
    loadout,
    statBonus: Object.keys(statBonus).length > 0 ? statBonus : computedBonus,
    loading,
    equipBusy,
    equipMessage,
    refresh,
    equipFromBag,
    unequipSlot,
    clearEquipMessage,
  };
}
