import { useAnimations, useGLTF } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group } from "three";

import type { AnimationState } from "../../../engine/art/animationStates";
import { BATTLE_FIGHTER_GLB_URL } from "../../../engine/art/battleFighterModels";
import { normalizeFighterScene } from "./normalizeFighterScene";
import { tintFighterMaterials } from "./tintFighterMaterials";
import type { FighterSide } from "./fighterPose";
import { useFighterGltfClip } from "./useFighterGltfClip";

type BattleFighterGltfProps = {
  side: FighterSide;
  animState: AnimationState;
};

export function BattleFighterGltf({ side, animState }: BattleFighterGltfProps) {
  const rigRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(BATTLE_FIGHTER_GLB_URL);
  const { actions } = useAnimations(animations, rigRef);

  const model = useMemo(() => {
    const clone = scene.clone(true) as Group;
    normalizeFighterScene(clone);
    tintFighterMaterials(clone, side);
    clone.traverse((obj) => {
      obj.frustumCulled = false;
      if ("castShadow" in obj) obj.castShadow = true;
    });
    return clone;
  }, [scene, side]);

  useFighterGltfClip(animState, actions);

  return <primitive ref={rigRef} object={model} />;
}
