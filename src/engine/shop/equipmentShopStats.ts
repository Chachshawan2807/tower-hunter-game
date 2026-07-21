import type { EquipmentSlot } from "../art/equipment/slots";
import type { GearStatBonus } from "../art/equipment/statBonuses";

const PREFIX_TO_SLOT: Record<string, EquipmentSlot> = {
  helm: "helm",
  chest: "chest",
  boots: "boots",
  gloves: "gloves",
  cloak: "cloak",
  "weapon-sword-shield": "weapon",
  "weapon-sword": "weapon",
  "weapon-sword-cross": "weapon",
  "weapon-axe": "weapon",
  "weapon-axe-cross": "weapon",
};

export function resolveSlotFromAssetPrefix(prefix: string): EquipmentSlot {
  return PREFIX_TO_SLOT[prefix] ?? "weapon";
}

/**
 * Per-item combat stats for shop gear (spec 2026-07-22-equipment-balance-design §3).
 */
export const SHOP_EQUIPMENT_STATS: Record<string, GearStatBonus[]> = {
  helm: [
    { def: 8 },
    { def: 14, maxHp: 25 },
    { def: 24, maxHp: 45 },
    { def: 36, maxHp: 70 },
    { def: 48, maxHp: 100 },
  ],
  chest: [
    { maxHp: 70 },
    { maxHp: 130 },
    { maxHp: 220 },
    { maxHp: 320, def: 18 },
    { maxHp: 420, def: 28 },
  ],
  boots: [
    { speed: 5 },
    { speed: 9 },
    { speed: 14 },
    { speed: 18, evasion: 5 },
    { speed: 22, evasion: 10 },
  ],
  gloves: [
    { critChance: 0.025 },
    { critChance: 0.035 },
    { critChance: 0.05 },
    { critChance: 0.06, accuracy: 8 },
    { critChance: 0.07, accuracy: 12 },
  ],
  cloak: [
    { statusResist: 0.04 },
    { statusResist: 0.055 },
    { statusResist: 0.075 },
    { statusResist: 0.095, maxMp: 50 },
    { statusResist: 0.12, maxMp: 80 },
  ],
  "weapon-sword-shield": [
    { atk: 9, def: 6 },
    { atk: 16, def: 11 },
    { atk: 28, def: 18 },
    { atk: 42, def: 26, critChance: 0.015 },
    { atk: 70, def: 40, critChance: 0.02 },
  ],
  "weapon-sword": [
    { atk: 12 },
    { atk: 22 },
    { atk: 38 },
    { atk: 56, critChance: 0.035 },
    { atk: 88, critChance: 0.05 },
  ],
  "weapon-sword-cross": [
    { atk: 11, speed: 2 },
    { atk: 20, speed: 3 },
    { atk: 34, critChance: 0.03, speed: 5 },
    { atk: 52, critChance: 0.055, speed: 6 },
    { atk: 82, critChance: 0.07, speed: 8 },
  ],
  "weapon-axe": [
    { atk: 12 },
    { atk: 22 },
    { atk: 38 },
    { atk: 56, critDamage: 0.2 },
    { atk: 86, critDamage: 0.3 },
  ],
  "weapon-axe-cross": [
    { atk: 11, critChance: 0.015 },
    { atk: 20, critChance: 0.02 },
    { atk: 34, critDamage: 0.12 },
    { atk: 52, critChance: 0.035, critDamage: 0.16 },
    { atk: 80, critChance: 0.04, critDamage: 0.2 },
  ],
};

export function getShopRowStats(prefix: string, variantIndex: number): GearStatBonus {
  const row = SHOP_EQUIPMENT_STATS[prefix];
  if (!row) return {};
  return row[variantIndex] ?? {};
}
