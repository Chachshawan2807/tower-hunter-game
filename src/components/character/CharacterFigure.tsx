import { memo } from "react";

import type { AnimationState } from "../../engine/art/animationStates";
import {
  archetypeForPlayer,
  enemyArchetypeForFloor,
  CHARACTER_ARCHETYPES,
  type CharacterArchetype,
} from "../../engine/art/characters";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import { isBossFloor, type SkillPath } from "../../engine/types";
import { CharacterSpriteSheet } from "./CharacterSpriteSheet";
import { HeroPortrait } from "./HeroPortrait";

export interface CharacterFigureProps {
  /** Used for path resolution; gear is baked into PNG sheets (no SVG overlay). */
  equipment?: CharacterEquipmentVisual;
  path?: SkillPath;
  archetype?: CharacterArchetype;
  side: "player" | "enemy" | "npc";
  animState: AnimationState;
  floor?: number;
  statusEffects?: import("../../engine/types").StatusEffectType[];
  className?: string;
  label?: string;
  size?: "stage" | "battle" | "menu" | "npc";
}

function statusFxClass(effects: import("../../engine/types").StatusEffectType[]): string {
  if (effects.includes("freeze") || effects.includes("stun")) return "fx-status--freeze";
  if (effects.includes("poison")) return "fx-status--poison";
  if (effects.includes("bleed")) return "fx-status--bleed";
  return "";
}

function resolveArchetype(
  side: CharacterFigureProps["side"],
  path: SkillPath,
  archetype: CharacterArchetype | undefined,
  floor: number | undefined
): CharacterArchetype {
  if (archetype) return archetype;
  if (side === "npc") return "merchant";
  if (side === "enemy") {
    return enemyArchetypeForFloor(floor ?? 1, isBossFloor(floor ?? 1));
  }
  return archetypeForPlayer(path);
}

export const CharacterFigure = memo(function CharacterFigure({
  equipment,
  path: pathProp,
  archetype: archetypeProp,
  side,
  animState,
  floor,
  statusEffects = [],
  className = "",
  label,
  size = "battle",
}: CharacterFigureProps) {
  const fx = statusFxClass(statusEffects);
  const path = pathProp ?? equipment?.path ?? "imperial";
  const archetype = resolveArchetype(side, path, archetypeProp, floor);
  const spec = CHARACTER_ARCHETYPES[archetype];
  const figureSize = size === "npc" ? "npc" : size;

  return (
    <figure
      className={[
        "character-figure",
        `character-figure--${size}`,
        side === "enemy" ? "character-figure--enemy" : "",
        side === "npc" ? "character-figure--npc" : `character-figure--${path}`,
        `character-figure--${animState}`,
        animState === "defeat" ? "fx-defeat--dissolve" : "",
        fx,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={label}
      role="img"
      style={{ ["--char-scale" as string]: String(spec.scale) }}
    >
      <div className="character-figure__sprite-wrap">
        {side === "player" ? (
          <HeroPortrait size={figureSize} />
        ) : (
          <CharacterSpriteSheet
            archetype={archetype}
            animState={animState}
            side={side}
            size={figureSize}
          />
        )}
      </div>

      {animState === "defeat" && (
        <span className="character-figure__smoke" aria-hidden="true" />
      )}
    </figure>
  );
});
