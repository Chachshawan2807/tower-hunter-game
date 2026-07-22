import { mergeEquipmentLoadout } from "../../engine/art/equipment/resolve";
import { bonusesFromEquipmentLoadout } from "../../engine/formulas/equipmentStats";
import type { GearStatBonus } from "../../engine/art/equipment/statBonuses";
import type { SkillPath } from "../../engine/types";
import {
  rowsToEquipmentDto,
  type EquipmentRow,
} from "../db/equipment";

export function equipmentPayloadFromRows(
  path: SkillPath,
  rows: EquipmentRow[]
) {
  const slots = rowsToEquipmentDto(rows);
  const statBonus: GearStatBonus = bonusesFromEquipmentLoadout(
    mergeEquipmentLoadout(path, slots)
  );
  return { path, slots, statBonus };
}
