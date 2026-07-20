import type { CombatStats } from "../types";
import type { GearStatBonus } from "../art/equipment/statBonuses";
import {
  getGearPieceStatBonus,
  mergeStatBonuses,
  resolveLoadoutPieceStatBonus,
} from "../art/equipment/statBonuses";
import type { PlayerEquipmentLoadout } from "../art/equipment/slots";
import { EQUIPMENT_SLOTS } from "../art/equipment/slots";

export function bonusesFromEquipmentLoadout(
  loadout: PlayerEquipmentLoadout
): GearStatBonus {
  const pieces = EQUIPMENT_SLOTS.flatMap((slot) => {
    const piece = loadout[slot];
    if (!piece) return [];
    return [resolveLoadoutPieceStatBonus(piece.gearId, slot, piece.rarity)];
  });
  return mergeStatBonuses(pieces);
}

export function applyEquipmentBonuses(
  base: CombatStats,
  bonus: GearStatBonus
): CombatStats {
  const maxHp = base.maxHp + (bonus.maxHp ?? 0);
  const maxMp = base.maxMp + (bonus.maxMp ?? 0);
  const hp = Math.min(base.hp + (bonus.maxHp ?? 0), maxHp);

  return {
    ...base,
    maxHp,
    maxMp,
    hp,
    mp: Math.min(base.mp + (bonus.maxMp ?? 0), maxMp),
    atk: base.atk + (bonus.atk ?? 0),
    def: base.def + (bonus.def ?? 0),
    speed: base.speed + (bonus.speed ?? 0),
    critChance: base.critChance + (bonus.critChance ?? 0),
    critDamage: base.critDamage + (bonus.critDamage ?? 0),
    accuracy: base.accuracy + (bonus.accuracy ?? 0),
    evasion: base.evasion + (bonus.evasion ?? 0),
    statusChance: base.statusChance + (bonus.statusChance ?? 0),
    statusResist: base.statusResist + (bonus.statusResist ?? 0),
  };
}

export function combatStatsWithEquipment(
  base: CombatStats,
  loadout: PlayerEquipmentLoadout
): CombatStats {
  return applyEquipmentBonuses(base, bonusesFromEquipmentLoadout(loadout));
}
