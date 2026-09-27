import { useGLTF } from "@react-three/drei";

import {
  BATTLE_FIGHTER_GLB_URL,
  BATTLE_HERO_GLB_URL,
  BATTLE_HERO_GLTF_AUTHORED,
} from "../../../engine/art/battleFighterModels";

let didPreload = false;

export function preloadBattleFighterModels(): void {
  if (didPreload) return;
  didPreload = true;
  useGLTF.preload(BATTLE_FIGHTER_GLB_URL);
  if (BATTLE_HERO_GLTF_AUTHORED) {
    useGLTF.preload(BATTLE_HERO_GLB_URL);
  }
}
