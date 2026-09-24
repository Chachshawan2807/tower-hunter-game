import { useGLTF } from "@react-three/drei";

import { BATTLE_FIGHTER_GLB_URL } from "../../../engine/art/battleFighterModels";

let didPreload = false;

export function preloadBattleFighterModels(): void {
  if (didPreload) return;
  didPreload = true;
  useGLTF.preload(BATTLE_FIGHTER_GLB_URL);
}
