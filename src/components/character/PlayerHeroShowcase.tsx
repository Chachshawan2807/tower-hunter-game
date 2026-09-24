import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { SkillPath } from "../../engine/types";
import { HomeHero3D } from "../render3d/home/HomeHero3D";
import { isBattle3dEnabled } from "../../utils/render3dEnv";
import { CharacterFigure } from "./CharacterFigure";

export type PlayerHeroShowcaseSize = "stage" | "menu";

export interface PlayerHeroShowcaseProps {
  size: PlayerHeroShowcaseSize;
  skillPath: SkillPath;
  displayName: string;
  equipment: CharacterEquipmentVisual;
}

export function PlayerHeroShowcase({
  size,
  skillPath,
  displayName,
  equipment,
}: PlayerHeroShowcaseProps) {
  const hero3d = isBattle3dEnabled();

  if (!hero3d) {
    return (
      <CharacterFigure
        equipment={equipment}
        path={skillPath}
        side="player"
        animState="idle"
        size={size}
        label={displayName}
      />
    );
  }

  const canvasClass =
    size === "stage" ? "hero-showcase__canvas3d" : "char-equip-stage__canvas3d";

  return (
    <figure
      className={[
        "character-figure",
        `character-figure--${size}`,
        `character-figure--${skillPath}`,
        "character-figure--idle",
        size === "menu" ? "char-equip-stage__hero" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={displayName}
      role="img"
    >
      <div className={`character-figure__sprite-wrap ${canvasClass}`}>
        <HomeHero3D />
      </div>
    </figure>
  );
}
