import { useTexture } from "@react-three/drei";

import { BATTLE_ENEMY_VIEW_URLS } from "../../../engine/art/battleEnemyViews";

let didPreload = false;

export function preloadBattleEnemyViews(): void {
  if (didPreload) return;
  didPreload = true;
  for (const url of Object.values(BATTLE_ENEMY_VIEW_URLS)) {
    useTexture.preload(url);
  }
}
