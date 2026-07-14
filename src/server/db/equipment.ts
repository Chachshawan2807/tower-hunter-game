import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import { DEFAULT_EQUIPMENT_BY_PATH } from "../../engine/art/equipment/defaults";
import type { SkillPath } from "../../engine/types";
import type { DbClient, DbPool } from "./client";

interface EquipmentRow {
  slot: EquipmentSlot;
  gear_id: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface EquipmentSlotDto {
  gearId: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export type PlayerEquipmentDto = Record<EquipmentSlot, EquipmentSlotDto>;

const SLOT_COLUMNS = `user_id, slot, gear_id, rarity, updated_at`;

export async function listPlayerEquipment(
  poolOrClient: DbPool | DbClient,
  userId: string
): Promise<EquipmentRow[]> {
  const result = await poolOrClient.query<EquipmentRow>(
    `SELECT slot, gear_id, rarity FROM player_equipment WHERE user_id = $1`,
    [userId]
  );
  return result.rows;
}

export async function upsertEquipmentSlot(
  poolOrClient: DbPool | DbClient,
  userId: string,
  slot: EquipmentSlot,
  gearId: string,
  rarity: EquipmentSlotDto["rarity"]
): Promise<EquipmentSlotDto> {
  const result = await poolOrClient.query<EquipmentRow>(
    `INSERT INTO player_equipment (user_id, slot, gear_id, rarity)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, slot) DO UPDATE
       SET gear_id = EXCLUDED.gear_id,
           rarity = EXCLUDED.rarity,
           updated_at = NOW()
     RETURNING slot, gear_id, rarity`,
    [userId, slot, gearId, rarity]
  );
  const row = result.rows[0];
  return { gearId: row.gear_id, rarity: row.rarity };
}

export async function seedDefaultEquipment(
  poolOrClient: DbPool | DbClient,
  userId: string,
  path: SkillPath
): Promise<void> {
  const defaults = DEFAULT_EQUIPMENT_BY_PATH[path];
  for (const [slot, piece] of Object.entries(defaults)) {
    await upsertEquipmentSlot(
      poolOrClient,
      userId,
      slot as EquipmentSlot,
      piece.gearId,
      piece.rarity
    );
  }
}

export function rowsToEquipmentDto(rows: EquipmentRow[]): Partial<PlayerEquipmentDto> {
  const out: Partial<PlayerEquipmentDto> = {};
  for (const row of rows) {
    out[row.slot] = { gearId: row.gear_id, rarity: row.rarity };
  }
  return out;
}
