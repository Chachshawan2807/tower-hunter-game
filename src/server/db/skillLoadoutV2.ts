import type { SkillLoadout } from "../../engine/skills/loadout";
import { DEFAULT_BATTLE_PREFS } from "../../engine/skills/loadout";
import type { DbPool } from "./client";

interface LoadoutV2Row {
  user_id: string;
  equipped_slots: string[];
  heal_override: boolean;
  heal_threshold: string;
  updated_at: Date;
}

const LOADOUT_V2_COLUMNS = `user_id, equipped_slots, heal_override, heal_threshold, updated_at`;

function toSkillLoadout(row: LoadoutV2Row): SkillLoadout {
  return {
    equippedSlots: row.equipped_slots ?? [],
    battlePrefs: {
      healOverrideEnabled: row.heal_override,
      healThreshold: Number(row.heal_threshold),
    },
  };
}

export async function getPlayerLoadoutV2(
  pool: DbPool,
  userId: string
): Promise<SkillLoadout | null> {
  const result = await pool.query<LoadoutV2Row>(
    `SELECT ${LOADOUT_V2_COLUMNS}
     FROM player_skill_loadout_v2
     WHERE user_id = $1`,
    [userId]
  );

  const row = result.rows[0];
  return row ? toSkillLoadout(row) : null;
}

export async function upsertPlayerLoadoutV2(
  pool: DbPool,
  userId: string,
  loadout: SkillLoadout
): Promise<SkillLoadout> {
  const prefs = loadout.battlePrefs ?? DEFAULT_BATTLE_PREFS;

  const result = await pool.query<LoadoutV2Row>(
    `INSERT INTO player_skill_loadout_v2 (
       user_id, equipped_slots, heal_override, heal_threshold
     )
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id)
     DO UPDATE SET
       equipped_slots = EXCLUDED.equipped_slots,
       heal_override = EXCLUDED.heal_override,
       heal_threshold = EXCLUDED.heal_threshold,
       updated_at = NOW()
     RETURNING ${LOADOUT_V2_COLUMNS}`,
    [userId, loadout.equippedSlots, prefs.healOverrideEnabled, prefs.healThreshold]
  );

  return toSkillLoadout(result.rows[0]);
}

export async function clearPlayerLoadoutV2(
  pool: DbPool,
  userId: string
): Promise<void> {
  await pool.query(`DELETE FROM player_skill_loadout_v2 WHERE user_id = $1`, [
    userId,
  ]);
}
