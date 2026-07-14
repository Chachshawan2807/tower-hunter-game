/**
 * Equipment slots visible on the character paper doll (Art Bible §07)
 */
export const EQUIPMENT_SLOTS = [
  "weapon",
  "helm",
  "chest",
  "gloves",
  "boots",
  "cloak",
] as const;

export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];

export interface EquippedPiece {
  gearId: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export type PlayerEquipmentLoadout = Record<EquipmentSlot, EquippedPiece>;
