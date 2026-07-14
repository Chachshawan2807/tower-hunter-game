import { memo } from "react";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import { WeaponSvg } from "../svg/WeaponSvg";
import { BootsLayer, CloakLayer, GlovesLayer } from "./appendageLayers";
import { ChestLayer, HelmLayer } from "./coreLayers";
import { EQUIP_GRADIENTS } from "./shared";

interface EquipmentLayersProps {
  equipment: CharacterEquipmentVisual;
  className?: string;
}

/** @deprecated PNG sheets bake gear visuals — do not mount over CharacterSpriteSheet (causes overlap). */
export const EquipmentLayers = memo(function EquipmentLayers({
  equipment,
  className = "",
}: EquipmentLayersProps) {
  const { path, pieceRarity } = equipment;

  return (
    <svg
      viewBox="0 0 120 200"
      className={`character-equip-layers ${className}`.trim()}
      aria-hidden="true"
    >
      {EQUIP_GRADIENTS}
      <CloakLayer path={path} cloakId={equipment.cloak} rarity={pieceRarity.cloak} />
      <ChestLayer path={path} chestId={equipment.chest} rarity={pieceRarity.chest} />
      <BootsLayer path={path} bootsId={equipment.boots} rarity={pieceRarity.boots} />
      <GlovesLayer path={path} glovesId={equipment.gloves} rarity={pieceRarity.gloves} />
      <HelmLayer path={path} helmId={equipment.helm} rarity={pieceRarity.helm} />
      <WeaponSvg weapon={equipment.weapon} rarity={equipment.weaponRarity} />
    </svg>
  );
});
