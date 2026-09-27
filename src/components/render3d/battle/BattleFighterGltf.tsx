import { useCallback } from "react";
import type { Group } from "three";

import type { AnimationState } from "../../../engine/art/animationStates";
import { BATTLE_FIGHTER_GLB_URL } from "../../../engine/art/battleFighterModels";
import { BattleFighterGltfRig } from "./BattleFighterGltfRig";
import { tintFighterMaterials } from "./tintFighterMaterials";
import type { FighterSide } from "./fighterPose";

type BattleFighterGltfProps = {
  side: FighterSide;
  animState: AnimationState;
};

export function BattleFighterGltf({ side, animState }: BattleFighterGltfProps) {
  const onClone = useCallback(
    (clone: Group) => {
      tintFighterMaterials(clone, side, { preserveTexturedMeshes: true });
    },
    [side]
  );

  return (
    <BattleFighterGltfRig
      modelUrl={BATTLE_FIGHTER_GLB_URL}
      animState={animState}
      onClone={onClone}
    />
  );
}
