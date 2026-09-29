import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";

import type { AnimationState } from "../../../engine/art/animationStates";
import { applyFaceOpponent } from "./applyFaceOpponent";
import { BattleFighterGltf } from "./BattleFighterGltf";
import { BattlePlayerHeroGltf } from "./BattlePlayerHeroGltf";
import { combatMotionOffset } from "./fighterCombatMotion";
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
  const motionClockRef = useRef({ state: animState, elapsed: 0 });

  useEffect(() => {
    motionClockRef.current = { state: animState, elapsed: 0 };
  }, [animState]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    if (motionClockRef.current.state === animState) {
      motionClockRef.current.elapsed += delta;
    }

    const motion = combatMotionOffset(
      side,
      animState,
      motionClockRef.current.elapsed
    );
    const targetX = slot.x + motion.x;
    const targetZ = slot.z + motion.z;

    const t = Math.min(1, delta * LERP);
    group.position.x += (targetX - group.position.x) * t;
    group.position.y += (slot.y - group.position.y) * t;
    group.position.z += (targetZ - group.position.z) * t;
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
