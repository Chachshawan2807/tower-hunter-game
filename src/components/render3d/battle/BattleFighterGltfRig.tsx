import { useAnimations, useGLTF } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group } from "three";

import type { AnimationState } from "../../../engine/art/animationStates";
import { normalizeFighterScene } from "./normalizeFighterScene";
import { useFighterGltfClip } from "./useFighterGltfClip";

type BattleFighterGltfRigProps = {
  modelUrl: string;
  animState: AnimationState;
  onClone: (clone: Group) => void;
};

export function BattleFighterGltfRig({
  modelUrl,
  animState,
  onClone,
}: BattleFighterGltfRigProps) {
  const rigRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, rigRef);

  const model = useMemo(() => {
    const clone = scene.clone(true) as Group;
    normalizeFighterScene(clone);
    onClone(clone);
    clone.traverse((obj) => {
      obj.frustumCulled = false;
      if ("castShadow" in obj) obj.castShadow = true;
    });
    return clone;
  }, [scene, onClone]);

  useFighterGltfClip(animState, actions);

  return <primitive ref={rigRef} object={model} />;
}
