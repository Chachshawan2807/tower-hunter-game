import { useCallback, useEffect, useMemo, useState } from "react";
import { mergeEquipmentLoadout, resolveCharacterEquipment } from "../engine/art/equipment";
import { bonusesFromEquipmentLoadout } from "../engine/formulas/equipmentStats";
import type { CharacterEquipmentVisual } from "../engine/art/equipment/catalog";
import type { GearStatBonus } from "../engine/art/equipment/statBonuses";
import type { EquipmentSlot, PlayerEquipmentLoadout } from "../engine/art/equipment/slots";
import type { SkillPath } from "../engine/types";
import { patchGameDataCache } from "../client/cache/gameDataStore";
import { getHotGameDataForUser } from "../client/cache/gameDataMemory";
import { runWithOfflineQueue } from "../client/offline/queueMutation";
import { api } from "../utils/api";
import { createActionIdempotencyKey } from "../utils/idempotencyKey";
import { t, type Locale } from "../utils/i18n";

export function usePlayerEquipment(
  userId: string | null,
  skillPath: SkillPath,
  locale: Locale = "en"
) {
  const hot = getHotGameDataForUser(userId);
  const [serverSlots, setServerSlots] = useState<
    Partial<PlayerEquipmentLoadout> | undefined
  >(hot?.equipment.slots as Partial<PlayerEquipmentLoadout> | undefined);
  const [statBonus, setStatBonus] = useState<GearStatBonus>(
    () => hot?.equipment.statBonus ?? {}
  );
  const [hydrated, setHydrated] = useState(Boolean(hot));
  const [equipBusy, setEquipBusy] = useState(false);
  const [equipMessage, setEquipMessage] = useState<string | null>(null);

  const applyEquipment = useCallback(
    (slots: Partial<PlayerEquipmentLoadout>, bonus: GearStatBonus) => {
      setServerSlots(slots);
      setStatBonus(bonus);
      setHydrated(true);
      if (userId) {
        patchGameDataCache(userId, {
          equipment: { path: skillPath, slots, statBonus: bonus },
        });
      }
    },
    [skillPath, userId]
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await api.getPlayerEquipment(userId);
      applyEquipment(data.slots, data.statBonus ?? {});
    } catch (err) {
      console.error("Failed to load equipment:", err);
    }
  }, [userId, applyEquipment]);

  useEffect(() => {
    if (!userId) {
      setServerSlots(undefined);
      setStatBonus({});
      setHydrated(false);
      return;
    }

    const cached = getHotGameDataForUser(userId);
    if (cached) {
      applyEquipment(cached.equipment.slots, cached.equipment.statBonus ?? {});
      return;
    }

    if (!hydrated) {
      void refresh();
    }
  }, [userId, hydrated, applyEquipment, refresh]);

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
        const idempotencyKey = createActionIdempotencyKey(
          "equip_from_bag",
          userId,
          `${slot}:${inventoryId}`
        );
        const result = await runWithOfflineQueue(
          "equip_from_bag",
          userId,
          idempotencyKey,
          { slot, inventoryId },
          () => api.equipFromBag(userId, slot, inventoryId)
        );

        if (result.status === "queued") {
          setEquipMessage(t("common.offline_queued", locale));
          return true;
        }
        if (result.status === "error") {
          throw result.error;
        }

        applyEquipment(result.data.loadout, statBonus);
        const bonusText = result.data.statBonusLines.join(" · ");
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
    [userId, equipBusy, applyEquipment, statBonus, locale]
  );

  const unequipSlot = useCallback(
    async (slot: EquipmentSlot) => {
      if (!userId || equipBusy) return false;
      setEquipBusy(true);
      setEquipMessage(null);
      try {
        const idempotencyKey = createActionIdempotencyKey(
          "unequip_slot",
          userId,
          slot
        );
        const result = await runWithOfflineQueue(
          "unequip_slot",
          userId,
          idempotencyKey,
          { slot },
          () => api.unequipSlot(userId, slot)
        );

        if (result.status === "queued") {
          setEquipMessage(t("common.offline_queued", locale));
          return true;
        }
        if (result.status === "error") {
          throw result.error;
        }

        applyEquipment(result.data.loadout, result.data.statBonus ?? {});
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
    [userId, equipBusy, applyEquipment, locale]
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
    loading: !hydrated,
    equipBusy,
    equipMessage,
    refresh,
    equipFromBag,
    unequipSlot,
    clearEquipMessage,
  };
}
