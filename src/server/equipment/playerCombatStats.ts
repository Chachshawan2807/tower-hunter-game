import { mergeEquipmentLoadout } from "../../engine/art/equipment/resolve";
import { bonusesFromEquipmentLoadout } from "../../engine/formulas/equipmentStats";
import type { GearStatBonus } from "../../engine/art/equipment/statBonuses";
import type { PlayerEquipmentLoadout } from "../../engine/art/equipment/slots";
import type { CombatStats, SkillPath } from "../../engine/types";
import { combatStatsWithEquipment } from "../../engine/formulas/equipmentStats";
import {
  listPlayerEquipment,
  rowsToEquipmentDto,
  seedDefaultEquipment,
} from "../db/equipment";
import { getPlayerSkillPath } from "../db/playerStats";
import { toCombatStats, type PlayerStatsRow } from "../db/playerStats";
import type { DbPool } from "../db/client";

export async function loadPlayerEquipmentLoadout(
  pool: DbPool,
  userId: string,
  path?: SkillPath
): Promise<PlayerEquipmentLoadout> {
  const skillPath: SkillPath = path ?? (await getPlayerSkillPath(pool, userId));
  let rows = await listPlayerEquipment(pool, userId);
  if (rows.length === 0) {
    await seedDefaultEquipment(pool, userId, skillPath);
    rows = await listPlayerEquipment(pool, userId);
  }
  return mergeEquipmentLoadout(skillPath, rowsToEquipmentDto(rows));
}

export async function getPlayerEquipmentBonuses(
  pool: DbPool,
  userId: string
): Promise<GearStatBonus> {
  const loadout = await loadPlayerEquipmentLoadout(pool, userId);
  return bonusesFromEquipmentLoadout(loadout);
}

export async function getPlayerCombatStatsWithEquipment(
  pool: DbPool,
  statsRow: PlayerStatsRow
): Promise<CombatStats> {
  const base = toCombatStats(statsRow);
  const loadout = await loadPlayerEquipmentLoadout(
    pool,
    statsRow.user_id,
    statsRow.active_skill_path
  );
  return combatStatsWithEquipment(base, loadout);
}
