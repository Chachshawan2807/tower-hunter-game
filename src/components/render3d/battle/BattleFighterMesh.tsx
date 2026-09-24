import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";

import type { AnimationState } from "../../../engine/art/animationStates";
import { BattleFighterGltf } from "./BattleFighterGltf";
import { slotPoseForSide, type FighterSide } from "./fighterPose";

const LERP = 10;

type BattleFighterMeshProps = {
  side: FighterSide;
  animState: AnimationState;
};

export function BattleFighterMesh({ side, animState }: BattleFighterMeshProps) {
  const groupRef = useRef<Group>(null);
  const slot = useMemo(() => slotPoseForSide(side), [side]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const t = Math.min(1, delta * LERP);
    group.position.x += (slot.x - group.position.x) * t;
    group.position.y += (slot.y - group.position.y) * t;
    group.position.z += (slot.z - group.position.z) * t;
    group.rotation.y += (slot.rotY - group.rotation.y) * t;
  });

  return (
    <group ref={groupRef}>
      <BattleFighterGltf side={side} animState={animState} />
    </group>
  );
}
