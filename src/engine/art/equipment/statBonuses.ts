import type { ItemRarityVisual } from "../weaponTypes";
import type { EquipmentSlot } from "./slots";

/** Flat stat bonuses per equipment piece (Art Bible §07 — primary unit gains) */
export interface GearStatBonus {
  maxHp?: number;
  maxMp?: number;
  atk?: number;
  def?: number;
  speed?: number;
  critChance?: number;
  critDamage?: number;
  accuracy?: number;
  evasion?: number;
  statusChance?: number;
  statusResist?: number;
}

const RARITY_MULTIPLIER: Record<ItemRarityVisual, number> = {
  common: 1,
  rare: 1.5,
  epic: 2.2,
  legendary: 3.5,
};

/** Base bonus template per slot before rarity scaling */
export const SLOT_STAT_TEMPLATE: Record<EquipmentSlot, GearStatBonus> = {
  weapon: { atk: 8 },
  helm: { def: 5 },
  chest: { maxHp: 40 },
  gloves: { critChance: 0.02 },
  boots: { speed: 4 },
  cloak: { statusResist: 0.03 },
};

/** Per-gear overrides (variant identity within slot) */
const GEAR_STAT_OVERRIDES: Partial<Record<string, GearStatBonus>> = {
  "gear.imperial.weapon.katana": { atk: 10, critChance: 0.01 },
  "gear.knight.weapon.greatsword": { atk: 14, def: 2 },
  "gear.fantasy.weapon.wand": { atk: 6, maxMp: 15, statusChance: 0.02 },
  "gear.knight.chest.plate": { maxHp: 55, def: 4 },
  "gear.fantasy.chest.leathers": { maxHp: 30, evasion: 3 },
};

function scaleBonus(bonus: GearStatBonus, mult: number): GearStatBonus {
  const out: GearStatBonus = {};
  for (const [key, value] of Object.entries(bonus) as Array<
    [keyof GearStatBonus, number]
  >) {
    if (value === undefined) continue;
    const scaled =
      key === "critChance" ||
      key === "critDamage" ||
      key === "statusChance" ||
      key === "statusResist"
        ? value * mult
        : Math.floor(value * mult);
    out[key] = scaled;
  }
  return out;
}

export function getGearPieceStatBonus(
  gearId: string,
  slot: EquipmentSlot,
  rarity: ItemRarityVisual
): GearStatBonus {
  const base = {
    ...SLOT_STAT_TEMPLATE[slot],
    ...GEAR_STAT_OVERRIDES[gearId],
  };
  return scaleBonus(base, RARITY_MULTIPLIER[rarity]);
}

export function mergeStatBonuses(bonuses: GearStatBonus[]): GearStatBonus {
  const total: GearStatBonus = {};
  for (const bonus of bonuses) {
    for (const [key, value] of Object.entries(bonus) as Array<
      [keyof GearStatBonus, number]
    >) {
      if (value === undefined) continue;
      total[key] = (total[key] ?? 0) + value;
    }
  }
  return total;
}

export function formatStatBonus(bonus: GearStatBonus): string[] {
  const lines: string[] = [];
  if (bonus.atk) lines.push(`ATK +${bonus.atk}`);
  if (bonus.def) lines.push(`DEF +${bonus.def}`);
  if (bonus.maxHp) lines.push(`HP +${bonus.maxHp}`);
  if (bonus.maxMp) lines.push(`MP +${bonus.maxMp}`);
  if (bonus.speed) lines.push(`SPD +${bonus.speed}`);
  if (bonus.critChance) lines.push(`CRIT +${(bonus.critChance * 100).toFixed(1)}%`);
  if (bonus.accuracy) lines.push(`ACC +${bonus.accuracy}`);
  if (bonus.evasion) lines.push(`EVA +${bonus.evasion}`);
  if (bonus.statusResist) {
    lines.push(`RES +${(bonus.statusResist * 100).toFixed(1)}%`);
  }
  return lines;
}
