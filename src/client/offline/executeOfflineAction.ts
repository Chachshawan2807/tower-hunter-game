import type { SkillLoadout } from "../../engine/skills/loadout";
import type { EquipSlotId } from "../../api/types";
import type { PlayerIntent } from "../../types";
import { api } from "../../utils/api";
import type { OfflineQueueItem } from "./types";

export async function executeOfflineAction(item: OfflineQueueItem): Promise<void> {
  switch (item.kind) {
    case "shop_purchase":
      await api.purchaseShopItem(
        item.userId,
        item.payload.itemId,
        item.idempotencyKey
      );
      return;

    case "shop_sell":
      await api.sellShopItem(
        item.userId,
        item.payload.inventoryId,
        item.idempotencyKey
      );
      return;

    case "equip_from_bag":
      await api.equipFromBag(
        item.userId,
        item.payload.slot as EquipSlotId,
        item.payload.inventoryId
      );
      return;

    case "unequip_slot":
      await api.unequipSlot(item.userId, item.payload.slot as EquipSlotId);
      return;

    case "skill_loadout": {
      const loadout = JSON.parse(item.payload.loadoutJson) as SkillLoadout;
      await api.patchSkillLoadout(item.userId, loadout);
      return;
    }

    case "skill_unlock":
      await api.unlockSkill(item.userId, item.payload.skillId);
      return;

    case "skill_upgrade":
      await api.upgradeSkill(item.userId, {
        skillId: item.payload.skillId,
        branch: item.payload.branch as
          | "damage"
          | "cooldown"
          | "mpCost"
          | "statusPotency"
          | "healPower"
          | "passivePotency",
      });
      return;

    case "skill_respec":
      await api.respecSkills(item.userId);
      return;

    case "status_allocate":
      await api.allocateStatusPoint(
        item.userId,
        item.payload.stat as Parameters<typeof api.allocateStatusPoint>[1]
      );
      return;

    case "status_reset":
      await api.resetStatusAllocations(item.userId);
      return;

    case "battle_start":
      await api.startBattle(
        item.userId,
        Number(item.payload.floor),
        item.payload.autoBattle === "true"
      );
      return;

    case "battle_step":
      await api.battleStep(item.payload.sessionId, Number(item.payload.maxSteps ?? "20"));
      return;

    case "battle_intent": {
      const intent = JSON.parse(item.payload.intentJson) as PlayerIntent;
      await api.battleIntent(item.payload.sessionId, intent);
      return;
    }

    default: {
      const _exhaustive: never = item.kind;
      throw new Error(`Unknown offline action: ${_exhaustive}`);
    }
  }
}

export function isBattleOfflineKind(kind: OfflineQueueItem["kind"]): boolean {
  return kind === "battle_start" || kind === "battle_step" || kind === "battle_intent";
}

export function isNonRetryableOfflineError(err: unknown): boolean {
  const status = (err as { status?: number }).status;
  if (status === 400 || status === 404 || status === 409) return true;
  const message = err instanceof Error ? err.message : String(err);
  return /SESSION_NOT_FOUND|INVALID_TURN|not found|turn nonce/i.test(message);
}
