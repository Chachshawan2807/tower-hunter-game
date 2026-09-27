import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import {
  DoubleSide,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type Texture,
} from "three";

import type { AnimationState } from "../../../engine/art/animationStates";
import type { BattleHeroViewId } from "../../../engine/art/battleHeroViews";
import { applyShowcaseViewLayer } from "./applyShowcaseViewLayer";
import { type HeroBillboardPresentation } from "./heroViewPlaneSize";
import { showcaseViewFromYaw } from "./showcaseHeroTurntable";
import { useShowcaseTurntableYawRef } from "./ShowcaseTurntableContext";

type TurnaroundHeroSingleMeshProps = {
  animState: AnimationState;
  presentation: HeroBillboardPresentation;
  textures: Record<BattleHeroViewId, Texture>;
  basePlane: { width: number; height: number };
};

export function TurnaroundHeroSingleMesh({
  animState,
  presentation,
  textures,
  basePlane,
}: TurnaroundHeroSingleMeshProps) {
  const { yawRef } = useShowcaseTurntableYawRef();
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshBasicMaterial>(null);
  const rootRef = useRef<Group>(null);

  useFrame(() => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    const root = rootRef.current;
    if (!mesh || !mat || !root) return;

    const { viewId, flipX } = showcaseViewFromYaw(yawRef.current);

    let scaleMul = 1;
    let opacity = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (presentation === "battle") {
      if (animState === "attack") {
        offsetX = 0.14;
        scaleMul = 1.04;
      } else if (animState === "hit_cc") {
        offsetX = -0.1;
        scaleMul = 0.98;
      } else if (animState === "defeat") {
        offsetY = -0.28;
        scaleMul = 0.88;
        opacity = 0.5;
      }
    } else if (animState === "attack") {
      scaleMul = 1.04;
    } else if (animState === "hit_cc") {
      scaleMul = 0.98;
    } else if (animState === "defeat") {
      scaleMul = 0.88;
      opacity = 0.5;
    }

    root.position.set(offsetX, offsetY, 0);

    applyShowcaseViewLayer(
      mesh,
      mat,
      viewId,
      flipX,
      opacity,
      textures,
      presentation,
      basePlane,
      scaleMul
    );
  });

  return (
    <group ref={rootRef}>
      <mesh
        ref={meshRef}
        position={[0, basePlane.height / 2, 0]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[basePlane.width, basePlane.height]} />
        <meshBasicMaterial
          ref={matRef}
          map={textures.front}
          transparent
          opacity={1}
          alphaTest={0.001}
          side={DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
