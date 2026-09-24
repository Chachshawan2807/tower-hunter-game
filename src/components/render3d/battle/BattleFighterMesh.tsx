import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";

import type { AnimationState } from "../../../engine/art/animationStates";
import { RENDER_3D_ART } from "../../../engine/art/render3d";
import { poseForAnimationState, type FighterSide } from "./fighterPose";

const LERP = 10;

type BattleFighterMeshProps = {
  side: FighterSide;
  animState: AnimationState;
};

export function BattleFighterMesh({ side, animState }: BattleFighterMeshProps) {
  const groupRef = useRef<Group>(null);
  const target = useMemo(
    () => poseForAnimationState(animState, side),
    [animState, side]
  );
  const bodyColor =
    side === "player" ? RENDER_3D_ART.accentHex : RENDER_3D_ART.dangerHex;

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const t = Math.min(1, delta * LERP);
    const idleBob =
      animState === "idle" ? Math.sin(state.clock.elapsedTime * 2.4) * 0.04 : 0;

    group.position.x += (target.x - group.position.x) * t;
    group.position.y += (target.y + idleBob - group.position.y) * t;
    group.position.z += (target.z - group.position.z) * t;
    group.rotation.x += (target.rotX - group.rotation.x) * t;
    group.rotation.y += (target.rotY - group.rotation.y) * t;

    const nextScale = target.scale;
    const s = group.scale.x + (nextScale - group.scale.x) * t;
    group.scale.setScalar(s);
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.28, 0.75, 6, 12]} />
        <meshStandardMaterial color={bodyColor} metalness={0.25} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.55, side === "player" ? 0.22 : -0.22]} rotation={[0, side === "player" ? 0 : Math.PI, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.65]} />
        <meshStandardMaterial color={RENDER_3D_ART.expHex} metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}
