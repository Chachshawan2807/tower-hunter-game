import type { CharacterArchetype } from "../../../../engine/art/characters/types";
import type { CharacterEquipmentVisual } from "../../../../engine/art/equipment/catalog";
import type { SkillPath } from "../../../../engine/types";
import { IsoBeastEnemy, IsoDemonEnemy } from "./IsoEnemies";
import { IsoFantasyHero, IsoKnightHero, IsoMurimHero } from "./IsoHeroes";
import { IsoMerchantNpc, IsoVillagerNpc } from "./IsoNpcs";

interface IsoFigureProps {
  archetype: CharacterArchetype | SkillPath;
  equipment?: CharacterEquipmentVisual;
  className?: string;
}

const VIEWBOX = "0 0 120 200";

export function IsoFigure({ archetype, equipment, className = "" }: IsoFigureProps) {
  const body = resolveBody(archetype, equipment);
  return (
    <svg
      viewBox={VIEWBOX}
      className={`iso-figure ${className}`.trim()}
      role="img"
      aria-hidden="true"
    >
      {body}
    </svg>
  );
}

function resolveBody(archetype: CharacterArchetype | SkillPath, equipment?: CharacterEquipmentVisual) {
  switch (archetype) {
    case "murim":
      return <IsoMurimHero equipment={equipment} />;
    case "knight":
      return <IsoKnightHero equipment={equipment} />;
    case "fantasy":
      return <IsoFantasyHero equipment={equipment} />;
    case "beast":
    case "guardian":
      return <IsoBeastEnemy />;
    case "demon":
      return <IsoDemonEnemy />;
    case "merchant":
      return <IsoMerchantNpc />;
    case "villager":
      return <IsoVillagerNpc />;
    default:
      return <IsoMurimHero equipment={equipment} />;
  }
}

export { IsoMurimHero, IsoKnightHero, IsoFantasyHero } from "./IsoHeroes";
export { IsoBeastEnemy, IsoDemonEnemy } from "./IsoEnemies";
export { IsoMerchantNpc, IsoVillagerNpc } from "./IsoNpcs";
