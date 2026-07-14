export { ART_PALETTE, type ArtPaletteKey } from "./palette";
export { SKIN_TONES, SKIN_CSS_VARS } from "./skinTones";
export { mapEventToCharacterState } from "./mapAnimationEvent";
export { resolveItemWeaponVisual, type ItemWeaponVisual } from "./resolveItemWeaponVisual";
export {
  TOWER_ZONES,
  clampFloor,
  getTowerZone,
  getTowerZoneProgress,
  zoneBackgroundUrl,
  type TowerZone,
  type TowerZoneId,
} from "./towerZones";
export {
  ANIMATION_STATE_ROW,
  CHARACTER_SHEET_URLS,
  SPRITE_FRAME_HEIGHT,
  SPRITE_FRAME_WIDTH,
  SPRITE_FRAMES_PER_ROW,
  sheetIdForArchetype,
  sheetIdForPath,
  type CharacterSheetId,
} from "./sprites/characterSheetConfig";
export {
  CHARACTER_ARCHETYPES,
  ISO_COLORS,
  archetypeForPlayer,
  enemyArchetypeForFloor,
  type CharacterArchetype,
  type CharacterArchetypeSpec,
  type CharacterRole,
  type EnemyArchetype,
  type NpcArchetype,
  type PlayerArchetype,
} from "./characters";
export { MATERIALS, type MaterialId, type MaterialSpec } from "./materials";
export {
  ANIMATION_STATES,
  ANIMATION_STATE_SPECS,
  isAnimationState,
  type AnimationState,
  type AnimationStateSpec,
} from "./animationStates";
export {
  WEAPONS_BY_PATH,
  RARITY_VISUAL,
  type WeaponCategoryId,
  type WeaponTypeSpec,
  type ItemRarityVisual,
} from "./weaponTypes";
export {
  EQUIPMENT_SLOTS,
  GEAR_CATALOG,
  DEFAULT_EQUIPMENT_BY_PATH,
  getGearEntry,
  resolveCharacterEquipment,
  mergeEquipmentLoadout,
  type EquipmentSlot,
  type EquippedPiece,
  type PlayerEquipmentLoadout,
  type GearCatalogEntry,
  type CharacterEquipmentVisual,
} from "./equipment";
