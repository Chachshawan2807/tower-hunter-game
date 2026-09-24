import { useTexture } from "@react-three/drei";

import { PLAYER_HERO_PORTRAIT_TEXTURE_URL } from "../../../engine/art/sprites/characterSheetConfig";

let didPreload = false;

export function preloadHomeHeroPortrait(): void {
  if (didPreload) return;
  didPreload = true;
  useTexture.preload(PLAYER_HERO_PORTRAIT_TEXTURE_URL);
}
