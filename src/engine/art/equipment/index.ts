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
export { DEFAULT_EQUIPMENT_BY_PATH, DEFAULT_WEAPON_BY_PATH } from "./defaults";
export { resolveEquipmentIconAsset, equipmentIconUrl } from "./iconAssets";
export {
  mergeEquipmentLoadout,
  loadoutToCharacterVisual,
  resolveCharacterEquipment,
  isEquipmentSlotEquipped,
} from "./resolve";
export { resolveEquippableItem, isEquippableItem } from "./itemMapping";
export {
  filterInventoryForEquipmentSlot,
  type InventoryBagEntry,
} from "./slotInventory";
export {
  getGearPieceStatBonus,
  resolveLoadoutPieceStatBonus,
  mergeStatBonuses,
  formatStatBonus,
  formatStatNumber,
  formatFlatBonusSuffix,
  formatFlatPercentBonusSuffix,
  formatPercentBonusSuffix,
  formatPercentPoints,
  formatStoredPercent,
  SLOT_STAT_TEMPLATE,
  type GearStatBonus,
} from "./statBonuses";
