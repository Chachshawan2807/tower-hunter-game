import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { SRGBColorSpace, type Group, type Texture } from "three";

import type { AnimationState } from "../../../engine/art/animationStates";
import {
  BATTLE_HERO_VIEW_URLS,
  type BattleHeroViewId,
} from "../../../engine/art/battleHeroViews";
import { BATTLE_PLAYER_DEFAULT_TURN_YAW } from "../../../engine/art/battleHeroTurnaround";
import { slotPoseForSide } from "../battle/fighterPose";
import { faceCameraYawBillboard } from "./faceCameraYawBillboard";
import { heroViewPlaneSize } from "./heroViewPlaneSize";
import { ShowcaseTurntableProvider } from "./ShowcaseTurntableContext";
import { TurnaroundHeroSingleMesh } from "./TurnaroundHeroSingleMesh";

const LERP = 10;
const VIEW_URLS = Object.values(BATTLE_HERO_VIEW_URLS);

function configureTexture(tex: Texture): Texture {
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

type InkKnightBattleTurnaroundMeshProps = {
  animState: AnimationState;
};

function InkKnightBattleTurnaroundMesh({ animState }: InkKnightBattleTurnaroundMeshProps) {
  const slotRef = useRef<Group>(null);
  const billboardRef = useRef<Group>(null);
  const slot = useMemo(() => slotPoseForSide("player"), []);
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
    () => heroViewPlaneSize(textures.front, "battle"),
    [textures.front]
  );

  useFrame((state, delta) => {
    const slotGroup = slotRef.current;
    const billboard = billboardRef.current;
    if (!slotGroup || !billboard) return;

    const t = Math.min(1, delta * LERP);
    slotGroup.position.x += (slot.x - slotGroup.position.x) * t;
    slotGroup.position.y += (slot.y - slotGroup.position.y) * t;
    slotGroup.position.z += (slot.z - slotGroup.position.z) * t;
    faceCameraYawBillboard(billboard, state.camera.position);
  });

  return (
    <group ref={slotRef}>
      <group ref={billboardRef}>
        <TurnaroundHeroSingleMesh
          animState={animState}
          presentation="battle"
          textures={textures}
          basePlane={basePlane}
        />
      </group>
    </group>
  );
}

type InkKnightBattleTurnaroundProps = {
  animState: AnimationState;
};

export function InkKnightBattleTurnaround({ animState }: InkKnightBattleTurnaroundProps) {
  return (
    <ShowcaseTurntableProvider initialYaw={BATTLE_PLAYER_DEFAULT_TURN_YAW}>
      <Suspense fallback={null}>
        <InkKnightBattleTurnaroundMesh animState={animState} />
      </Suspense>
    </ShowcaseTurntableProvider>
  );
}
