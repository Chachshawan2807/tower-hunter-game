import { BATTLE_FIGHTER_TARGET_HEIGHT } from "../../../engine/art/battleFighterModels";
import { HOME_HERO_PORTRAIT_HEIGHT } from "../home/homeHeroFraming";
import type { Texture } from "three";

export type HeroBillboardPresentation = "battle" | "showcase";

function textureAspect(tex: Texture): number {
  const img = tex.image as { width?: number; height?: number } | undefined;
  if (img?.width && img?.height && img.height > 0) {
    return img.width / img.height;
  }
  return 413 / 985;
}

/** Same world height for every turnaround view; width follows each PNG aspect. */
export function heroViewPlaneSize(
  tex: Texture,
  presentation: HeroBillboardPresentation
): { width: number; height: number } {
  const height =
    presentation === "showcase" ? HOME_HERO_PORTRAIT_HEIGHT : BATTLE_FIGHTER_TARGET_HEIGHT;
  const aspect = textureAspect(tex);
  return { width: height * aspect, height };
}
