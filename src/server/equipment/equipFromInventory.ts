import { getGearEntry } from "../../engine/art/equipment/catalog";
import { mergeEquipmentLoadout } from "../../engine/art/equipment/resolve";
import { resolveEquippableItem } from "../../engine/art/equipment/itemMapping";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import { bonusesFromEquipmentLoadout } from "../../engine/formulas/equipmentStats";
import { formatStatBonus } from "../../engine/art/equipment/statBonuses";
import type { DbPool } from "../db/client";
import {
  listPlayerEquipment,
  rowsToEquipmentDto,
  upsertEquipmentSlot,
  type EquipmentSlotDto,
  type PlayerEquipmentDto,
} from "../db/equipment";
import { getInventoryItemById } from "../db/inventory";
import { getPlayerSkillPath } from "../db/playerStats";
import { withTransaction } from "../db/client";

export class EquipValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "EquipValidationError";
  }
}

export interface EquipFromInventoryInput {
  userId: string;
  inventoryId: string;
  slot: EquipmentSlot;
}

export interface EquipFromInventoryResult {
  slot: EquipmentSlot;
  equipped: EquipmentSlotDto;
  loadout: PlayerEquipmentDto;
  statBonusLines: string[];
}

export async function equipFromInventory(
  pool: DbPool,
  input: EquipFromInventoryInput
): Promise<EquipFromInventoryResult> {
  return withTransaction(pool, async (client) => {
    const path = await getPlayerSkillPath(client, input.userId);
    const invRow = await getInventoryItemById(client, input.userId, input.inventoryId);

    if (!invRow) {
      throw new EquipValidationError("Inventory item not found", "ITEM_NOT_FOUND");
    }

    const resolved = resolveEquippableItem(invRow.item_id, path);
    if (!resolved) {
      throw new EquipValidationError("Item is not equippable", "NOT_EQUIPPABLE");
    }

    if (resolved.slot !== input.slot) {
      throw new EquipValidationError(
        `Item belongs in ${resolved.slot} slot`,
        "SLOT_MISMATCH"
      );
    }

    const entry = getGearEntry(resolved.gearId);
    if (!entry || entry.path !== path) {
      throw new EquipValidationError("Gear path mismatch", "PATH_MISMATCH");
    }

    const rarity = invRow.rarity as EquipmentSlotDto["rarity"];
    const equipped = await upsertEquipmentSlot(
      client,
      input.userId,
      input.slot,
      resolved.gearId,
      rarity
    );

    const rows = await listPlayerEquipment(client, input.userId);
    const partial = rowsToEquipmentDto(rows);
    const loadout = mergeEquipmentLoadout(path, partial) as PlayerEquipmentDto;
    const statBonus = bonusesFromEquipmentLoadout(loadout);

    return {
      slot: input.slot,
      equipped,
      loadout,
      statBonusLines: formatStatBonus(statBonus),
    };
  });
}
