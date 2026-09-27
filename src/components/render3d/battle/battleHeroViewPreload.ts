import { useTexture } from "@react-three/drei";

import { BATTLE_HERO_VIEW_URLS } from "../../../engine/art/battleHeroViews";

let didPreload = false;

export function preloadBattleHeroViews(): void {
  if (didPreload) return;
  didPreload = true;
  for (const url of Object.values(BATTLE_HERO_VIEW_URLS)) {
    useTexture.preload(url);
  }
}
