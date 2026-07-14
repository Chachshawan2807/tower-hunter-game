export {
  EQUIPMENT_SLOTS,
  type EquipmentSlot,
  type EquippedPiece,
  type PlayerEquipmentLoadout,
} from "./slots";
export {
  GEAR_CATALOG,
  getGearEntry,
  type GearCatalogEntry,
  type CharacterEquipmentVisual,
} from "./catalog";
export { DEFAULT_EQUIPMENT_BY_PATH } from "./defaults";
export {
  mergeEquipmentLoadout,
  loadoutToCharacterVisual,
  resolveCharacterEquipment,
} from "./resolve";
export { resolveEquippableItem, isEquippableItem } from "./itemMapping";
export {
  getGearPieceStatBonus,
  mergeStatBonuses,
  formatStatBonus,
  SLOT_STAT_TEMPLATE,
  type GearStatBonus,
} from "./statBonuses";
