import { useCallback } from "react";
import type { Group } from "three";

import type { AnimationState } from "../../../engine/art/animationStates";
import { BATTLE_HERO_GLB_URL } from "../../../engine/art/battleFighterModels";
import { configurePlayerHeroMaterials } from "./configurePlayerHeroMaterials";
import { BattleFighterGltfRig } from "./BattleFighterGltfRig";

type BattlePlayerHeroGltfProps = {
  animState: AnimationState;
};

/** Player battle hero — drop-in `public/models/battle-hero.glb` (see BATTLE_FIGHTER_3D_BRIEF). */
export function BattlePlayerHeroGltf({ animState }: BattlePlayerHeroGltfProps) {
  const onClone = useCallback((clone: Group) => {
    configurePlayerHeroMaterials(clone);
  }, []);

  return (
    <BattleFighterGltfRig
      modelUrl={BATTLE_HERO_GLB_URL}
      animState={animState}
      onClone={onClone}
    />
  );
}
