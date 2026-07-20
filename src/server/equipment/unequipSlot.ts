import { mergeEquipmentLoadout } from "../../engine/art/equipment/resolve";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { DbPool } from "../db/client";
import { withTransaction } from "../db/client";
import {
  deleteEquipmentSlot,
  listPlayerEquipment,
  rowsToEquipmentDto,
  type PlayerEquipmentDto,
} from "../db/equipment";
import { getPlayerSkillPath } from "../db/playerStats";

export class UnequipValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "UnequipValidationError";
  }
}

export interface UnequipSlotInput {
  userId: string;
  slot: EquipmentSlot;
}

export interface UnequipSlotResult {
  slot: EquipmentSlot;
  loadout: PlayerEquipmentDto;
}

export async function unequipSlot(
  pool: DbPool,
  input: UnequipSlotInput
): Promise<UnequipSlotResult> {
  return withTransaction(pool, async (client) => {
    const path = await getPlayerSkillPath(client, input.userId);
    const removed = await deleteEquipmentSlot(client, input.userId, input.slot);

    if (!removed) {
      throw new UnequipValidationError("Slot is already empty", "SLOT_EMPTY");
    }

    const rows = await listPlayerEquipment(client, input.userId);
    const partial = rowsToEquipmentDto(rows);
    const loadout = mergeEquipmentLoadout(path, partial);

    return {
      slot: input.slot,
      loadout,
    };
  });
}
