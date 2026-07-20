import type { EquipmentSlot } from "../../engine/art/equipment/slots";
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

export type PlayerEquipmentDto = Partial<Record<EquipmentSlot, EquipmentSlotDto>>;

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

export async function deleteEquipmentSlot(
  poolOrClient: DbPool | DbClient,
  userId: string,
  slot: EquipmentSlot
): Promise<boolean> {
  const result = await poolOrClient.query(
    `DELETE FROM player_equipment WHERE user_id = $1 AND slot = $2`,
    [userId, slot]
  );
  return (result.rowCount ?? 0) > 0;
}

export function rowsToEquipmentDto(rows: EquipmentRow[]): PlayerEquipmentDto {
  const out: PlayerEquipmentDto = {};
  for (const row of rows) {
    out[row.slot] = { gearId: row.gear_id, rarity: row.rarity };
  }
  return out;
}
