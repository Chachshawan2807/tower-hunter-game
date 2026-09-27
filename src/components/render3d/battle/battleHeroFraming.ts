import { BATTLE_FIGHTER_TARGET_HEIGHT } from "../../../engine/art/battleFighterModels";
import { HOME_HERO_PORTRAIT_ASPECT } from "../home/homeHeroFraming";

/** Battle arena portrait — same asset as home, scaled to fighter height (feet at y = 0). */
export function battleHeroPlaneSize(textureAspect: number): {
  width: number;
  height: number;
} {
  const height = BATTLE_FIGHTER_TARGET_HEIGHT;
  const aspect = textureAspect > 0 ? textureAspect : HOME_HERO_PORTRAIT_ASPECT;
  return { width: height * aspect, height };
}
