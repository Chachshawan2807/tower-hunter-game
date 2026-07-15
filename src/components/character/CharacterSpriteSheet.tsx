import { memo } from "react";
import type { AnimationState } from "../../engine/art/animationStates";
import {
  ANIMATION_STATE_ROW,
  CHARACTER_SHEET_URLS,
  SPRITE_FRAME_HEIGHT,
  SPRITE_FRAME_WIDTH,
  SPRITE_FRAMES_PER_ROW,
  sheetIdForArchetype,
} from "../../engine/art/sprites/characterSheetConfig";
import type { CharacterArchetype } from "../../engine/art/characters/types";

interface CharacterSpriteSheetProps {
  archetype: CharacterArchetype;
  animState: AnimationState;
  side?: "player" | "enemy" | "npc";
  size?: "stage" | "battle" | "menu" | "npc";
}

function sheetScale(size: CharacterSpriteSheetProps["size"]): number {
  if (size === "stage") return 210 / SPRITE_FRAME_WIDTH;
  if (size === "menu") return 140 / SPRITE_FRAME_WIDTH;
  if (size === "npc") return 96 / SPRITE_FRAME_WIDTH;
  return 110 / SPRITE_FRAME_WIDTH;
}

export const CharacterSpriteSheet = memo(function CharacterSpriteSheet({
  archetype,
  animState,
  side = "player",
  size = "battle",
}: CharacterSpriteSheetProps) {
  const sheetId = sheetIdForArchetype(archetype);
  const row = ANIMATION_STATE_ROW[animState];
  const scale = sheetScale(size);
  const displayW = SPRITE_FRAME_WIDTH * scale;
  const displayH = SPRITE_FRAME_HEIGHT * scale;
  const sheetW = SPRITE_FRAME_WIDTH * SPRITE_FRAMES_PER_ROW * scale;
  const sheetH = SPRITE_FRAME_HEIGHT * 4 * scale;
  const rowOffsetY = row * SPRITE_FRAME_HEIGHT * scale;
  const frameStepX = displayW;

  return (
    <span
      className={[
        "character-sprite-sheet",
        `character-sprite-sheet--${animState}`,
        side === "enemy" ? "character-sprite-sheet--enemy" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: displayW,
        height: displayH,
        backgroundImage: `url(${CHARACTER_SHEET_URLS[sheetId]})`,
        backgroundSize: `${sheetW}px ${sheetH}px`,
        backgroundPosition: `0px -${rowOffsetY}px`,
        ["--sprite-frame-w" as string]: `${frameStepX}px`,
        ["--sprite-row-y" as string]: `-${rowOffsetY}px`,
        ["--sprite-frame-count" as string]: String(SPRITE_FRAMES_PER_ROW),
      }}
      aria-hidden="true"
    />
  );
});
