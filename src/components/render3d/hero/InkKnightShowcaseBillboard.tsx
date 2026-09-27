import { useTexture } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { SRGBColorSpace, type Texture } from "three";

import type { AnimationState } from "../../../engine/art/animationStates";
import {
  BATTLE_HERO_VIEW_URLS,
  type BattleHeroViewId,
} from "../../../engine/art/battleHeroViews";
import { HomeHeroCameraRig } from "../home/HomeHeroCameraRig";
import { heroViewPlaneSize, type HeroBillboardPresentation } from "./heroViewPlaneSize";
import { ShowcaseTurnaroundMeshes } from "./ShowcaseTurnaroundMeshes";
import { ShowcaseTurntableProvider } from "./ShowcaseTurntableContext";

const VIEW_URLS = Object.values(BATTLE_HERO_VIEW_URLS);

function configureTexture(tex: Texture): Texture {
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

type InkKnightShowcaseBillboardMeshProps = {
  animState: AnimationState;
};

function InkKnightShowcaseBillboardMesh({ animState }: InkKnightShowcaseBillboardMeshProps) {
  const presentation: HeroBillboardPresentation = "showcase";
  const loaded = useTexture(VIEW_URLS);
  const textures = useMemo(
    () =>
      ({
        front: configureTexture(loaded[0]),
        back: configureTexture(loaded[1]),
        side: configureTexture(loaded[2]),
        threeQuarter: configureTexture(loaded[3]),
      }) satisfies Record<BattleHeroViewId, Texture>,
    [loaded]
  );

  const basePlane = useMemo(
    () => heroViewPlaneSize(textures.front, presentation),
    [textures.front]
  );

  const cameraFraming = useMemo(() => {
    const sizes = Object.values(textures).map((tex) =>
      heroViewPlaneSize(tex, presentation)
    );
    const height = sizes[0]?.height ?? basePlane.height;
    const width = Math.max(...sizes.map((s) => s.width), basePlane.width);
    return { width, height };
  }, [textures, basePlane]);

  return (
    <ShowcaseTurntableProvider>
      <HomeHeroCameraRig
        planeWidth={cameraFraming.width}
        planeHeight={cameraFraming.height}
      />
      <ShowcaseTurnaroundMeshes
        animState={animState}
        presentation={presentation}
        textures={textures}
        basePlane={basePlane}
      />
    </ShowcaseTurntableProvider>
  );
}

export type InkKnightShowcaseBillboardProps = {
  animState?: AnimationState;
};

export function InkKnightShowcaseBillboard({
  animState = "idle",
}: InkKnightShowcaseBillboardProps) {
  return (
    <Suspense fallback={null}>
      <InkKnightShowcaseBillboardMesh animState={animState} />
    </Suspense>
  );
}
