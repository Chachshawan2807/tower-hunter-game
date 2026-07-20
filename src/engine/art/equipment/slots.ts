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

/** Equipped pieces only — omitted slots are unequipped. */
export type PlayerEquipmentLoadout = Partial<Record<EquipmentSlot, EquippedPiece>>;
