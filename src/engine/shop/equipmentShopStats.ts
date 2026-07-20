import type { EquipmentSlot } from "../art/equipment/slots";
import type { GearStatBonus } from "../art/equipment/statBonuses";

const PREFIX_TO_SLOT: Record<string, EquipmentSlot> = {
  helm: "helm",
  chest: "chest",
  boots: "boots",
  gloves: "gloves",
  cloak: "cloak",
  shield: "weapon",
  "weapon-sword": "weapon",
  "weapon-sword-cross": "weapon",
  "weapon-axe": "weapon",
  "weapon-axe-cross": "weapon",
};

export function resolveSlotFromAssetPrefix(prefix: string): EquipmentSlot {
  return PREFIX_TO_SLOT[prefix] ?? "weapon";
}

/**
 * Per-item combat stats for shop gear.
 * Rules:
 * - Each equipment type boosts ONE primary stat (v01–v03).
 * - Top 2 price tiers per type (v04–v05) add a secondary stat.
 * - No rarity — values are authored per variant.
 */
export const SHOP_EQUIPMENT_STATS: Record<string, GearStatBonus[]> = {
  /** Helm → DEF */
  helm: [
    { def: 5 },
    { def: 6 },
    { def: 10 },
    { def: 14, maxHp: 30 },
    { def: 18, maxHp: 50 },
  ],
  /** Chest → HP */
  chest: [
    { maxHp: 40 },
    { maxHp: 48 },
    { maxHp: 80 },
    { maxHp: 110, def: 8 },
    { maxHp: 150, def: 12 },
  ],
  /** Boots → SPD */
  boots: [
    { speed: 4 },
    { speed: 5 },
    { speed: 8 },
    { speed: 11, evasion: 3 },
    { speed: 15, evasion: 6 },
  ],
  /** Sword → ATK */
  "weapon-sword": [
    { atk: 7 },
    { atk: 9 },
    { atk: 14 },
    { atk: 20, critChance: 0.015 },
    { atk: 28, critChance: 0.025 },
  ],
  /** Dual swords → ATK */
  "weapon-sword-cross": [
    { atk: 8 },
    { atk: 10 },
    { atk: 16 },
    { atk: 22, critChance: 0.015 },
    { atk: 32, critChance: 0.03 },
  ],
  /** Shield → DEF (weapon slot, defensive) */
  shield: [
    { def: 6 },
    { def: 7 },
    { def: 12 },
    { def: 16, maxHp: 35 },
    { def: 22, maxHp: 55 },
  ],
  /** Gloves → CRIT */
  gloves: [
    { critChance: 0.02 },
    { critChance: 0.025 },
    { critChance: 0.035 },
    { critChance: 0.045, critDamage: 0.1 },
    { critChance: 0.06, critDamage: 0.2 },
  ],
  /** Cloak → Status resist */
  cloak: [
    { statusResist: 0.03 },
    { statusResist: 0.035 },
    { statusResist: 0.055 },
    { statusResist: 0.075, evasion: 2 },
    { statusResist: 0.1, evasion: 5 },
  ],
  /** Axe → ATK */
  "weapon-axe": [
    { atk: 8 },
    { atk: 10 },
    { atk: 16 },
    { atk: 23, critDamage: 0.12 },
    { atk: 33, critDamage: 0.22 },
  ],
  /** Dual axes → ATK */
  "weapon-axe-cross": [
    { atk: 9 },
    { atk: 11 },
    { atk: 18 },
    { atk: 25, critDamage: 0.15 },
    { atk: 36, critDamage: 0.25 },
  ],
};

export function getShopRowStats(prefix: string, variantIndex: number): GearStatBonus {
  const row = SHOP_EQUIPMENT_STATS[prefix];
  if (!row) return {};
  return row[variantIndex] ?? {};
}
