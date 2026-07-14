import type { SkillLoadout } from "../../engine/skills/loadout";
import type { SkillPath } from "../../engine/types";
import type { DbPool } from "./client";

interface LoadoutRow {
  user_id: string;
  path: SkillPath;
  active_slot_1: string;
  active_slot_2: string;
  updated_at: Date;
}

const LOADOUT_COLUMNS = `user_id, path, active_slot_1, active_slot_2, updated_at`;

function toSkillLoadout(row: LoadoutRow): SkillLoadout {
  return {
    path: row.path,
    activeSlots: [row.active_slot_1, row.active_slot_2],
  };
}

export async function getPlayerLoadout(
  pool: DbPool,
  userId: string,
  path: SkillPath
): Promise<SkillLoadout | null> {
  const result = await pool.query<LoadoutRow>(
    `SELECT ${LOADOUT_COLUMNS}
     FROM player_skill_loadout
     WHERE user_id = $1 AND path = $2`,
    [userId, path]
  );

  const row = result.rows[0];
  return row ? toSkillLoadout(row) : null;
}

export async function upsertPlayerLoadout(
  pool: DbPool,
  userId: string,
  loadout: SkillLoadout
): Promise<SkillLoadout> {
  const [slot1, slot2] = loadout.activeSlots;

  const result = await pool.query<LoadoutRow>(
    `INSERT INTO player_skill_loadout (user_id, path, active_slot_1, active_slot_2)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, path)
     DO UPDATE SET
       active_slot_1 = EXCLUDED.active_slot_1,
       active_slot_2 = EXCLUDED.active_slot_2,
       updated_at = NOW()
     RETURNING ${LOADOUT_COLUMNS}`,
    [userId, loadout.path, slot1, slot2]
  );

  return toSkillLoadout(result.rows[0]);
}
