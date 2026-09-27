import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";

import type { AnimationState } from "../../../engine/art/animationStates";
import { applyFaceOpponent } from "./applyFaceOpponent";
import { BattleFighterGltf } from "./BattleFighterGltf";
import { BattlePlayerHeroGltf } from "./BattlePlayerHeroGltf";
import { slotPoseForSide, type FighterSide } from "./fighterPose";

const LERP = 10;

type BattleFighterMeshProps = {
  side: FighterSide;
  animState: AnimationState;
  /** Player-only: visual-hull GLB from turnaround PNGs. */
  playerHeroGltf?: boolean;
};

export function BattleFighterMesh({
  side,
  animState,
  playerHeroGltf = false,
}: BattleFighterMeshProps) {
  const groupRef = useRef<Group>(null);
  const slot = useMemo(() => slotPoseForSide(side), [side]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const t = Math.min(1, delta * LERP);
    group.position.x += (slot.x - group.position.x) * t;
    group.position.y += (slot.y - group.position.y) * t;
    group.position.z += (slot.z - group.position.z) * t;
    applyFaceOpponent(group, side);
  });

  const model =
    side === "player" && playerHeroGltf ? (
      <BattlePlayerHeroGltf animState={animState} />
    ) : (
      <BattleFighterGltf side={side} animState={animState} />
    );

  return <group ref={groupRef}>{model}</group>;
}
