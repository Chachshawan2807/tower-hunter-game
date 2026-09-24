import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { DoubleSide, SRGBColorSpace, type Group } from "three";

import { PLAYER_HERO_PORTRAIT_TEXTURE_URL } from "../../../engine/art/sprites/characterSheetConfig";
import { HomeHeroCameraRig } from "./HomeHeroCameraRig";
import { HOME_HERO_PORTRAIT_ASPECT, homeHeroPlaneSize } from "./homeHeroFraming";

function HomeHeroBillboardMesh() {
  const groupRef = useRef<Group>(null);
  const texture = useTexture(PLAYER_HERO_PORTRAIT_TEXTURE_URL);

  const { width, height } = useMemo(() => {
    texture.colorSpace = SRGBColorSpace;
    const img = texture.image as { width?: number; height?: number } | undefined;
    const aspect =
      img?.width && img?.height && img.height > 0 ? img.width / img.height : HOME_HERO_PORTRAIT_ASPECT;
    return homeHeroPlaneSize(aspect);
  }, [texture]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const t = state.clock.elapsedTime;
    group.position.y = Math.sin(t * 1.25) * 0.042;
    group.rotation.y = Math.sin(t * 0.7) * 0.1;
    const breathe = 1 + Math.sin(t * 1.05) * 0.018;
    group.scale.set(-breathe, breathe, breathe);
  });

  return (
    <>
      <HomeHeroCameraRig planeWidth={width} planeHeight={height} />
      <group ref={groupRef}>
        <mesh position={[0, height / 2, 0]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.02}
            side={DoubleSide}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  );
}

export function HomeHeroBillboard() {
  return (
    <Suspense fallback={null}>
      <HomeHeroBillboardMesh />
    </Suspense>
  );
}
