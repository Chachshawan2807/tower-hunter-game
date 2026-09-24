import type { Texture } from "three";

import { HOME_HERO_PORTRAIT_ASPECT, homeHeroPlaneSize } from "./homeHeroFraming";

export function planeSizeFromTexture(texture: Texture): { width: number; height: number } {
  const img = texture.image as { width?: number; height?: number } | undefined;
  const aspect =
    img?.width && img?.height && img.height > 0 ? img.width / img.height : HOME_HERO_PORTRAIT_ASPECT;
  return homeHeroPlaneSize(aspect);
}
