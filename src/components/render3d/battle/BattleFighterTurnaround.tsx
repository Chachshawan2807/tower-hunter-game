import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { type Group, type Texture } from "three";

import type { AnimationState } from "../../../engine/art/animationStates";
import { BATTLE_ENEMY_VIEW_URLS } from "../../../engine/art/battleEnemyViews";
import {
  BATTLE_HERO_VIEW_URLS,
  type BattleHeroViewId,
} from "../../../engine/art/battleHeroViews";
import { configureTurnaroundBillboardTexture } from "../hero/configureTurnaroundBillboardTexture";
import { faceCameraYawBillboard } from "../hero/faceCameraYawBillboard";
import { heroViewPlaneSize } from "../hero/heroViewPlaneSize";
import { TurnaroundHeroSingleMesh } from "../hero/TurnaroundHeroSingleMesh";
import {
  turnaroundAnchorsForViews,
  type TurnaroundTextureAnchor,
} from "../hero/turnaroundTextureAnchor";
import { slotPoseForSide, type FighterSide } from "./fighterPose";

const LERP = 10;

type BattleFighterTurnaroundMeshProps = {
  side: FighterSide;
  animState: AnimationState;
  viewUrls: string[];
};

function BattleFighterTurnaroundMesh({
  side,
  animState,
  viewUrls,
}: BattleFighterTurnaroundMeshProps) {
  const slotRef = useRef<Group>(null);
  const billboardRef = useRef<Group>(null);
  const slot = useMemo(() => slotPoseForSide(side), [side]);
  const loaded = useTexture(viewUrls);
  const textures = useMemo(
    () =>
      ({
        front: configureTurnaroundBillboardTexture(loaded[0]),
        back: configureTurnaroundBillboardTexture(loaded[1]),
        side: configureTurnaroundBillboardTexture(loaded[2]),
        threeQuarter: configureTurnaroundBillboardTexture(loaded[3]),
      }) satisfies Record<BattleHeroViewId, Texture>,
    [loaded]
  );

  const basePlane = useMemo(
    () => heroViewPlaneSize(textures.front, "battle"),
    [textures.front]
  );

  const anchors = useMemo(
    () => turnaroundAnchorsForViews(textures) as Record<BattleHeroViewId, TurnaroundTextureAnchor>,
    [textures]
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
          anchors={anchors}
          basePlane={basePlane}
          battleSide={side}
        />
      </group>
    </group>
  );
}

const HERO_VIEW_URLS = [
  BATTLE_HERO_VIEW_URLS.front,
  BATTLE_HERO_VIEW_URLS.back,
  BATTLE_HERO_VIEW_URLS.side,
  BATTLE_HERO_VIEW_URLS.threeQuarter,
] as const;

const ENEMY_VIEW_URLS = [
  BATTLE_ENEMY_VIEW_URLS.front,
  BATTLE_ENEMY_VIEW_URLS.back,
  BATTLE_ENEMY_VIEW_URLS.side,
  BATTLE_ENEMY_VIEW_URLS.threeQuarter,
] as const;

type BattleFighterTurnaroundProps = {
  side: FighterSide;
  animState: AnimationState;
};

export function BattleFighterTurnaround({ side, animState }: BattleFighterTurnaroundProps) {
  const viewUrls = [...(side === "player" ? HERO_VIEW_URLS : ENEMY_VIEW_URLS)];

  return (
    <Suspense fallback={null}>
      <BattleFighterTurnaroundMesh
        side={side}
        animState={animState}
        viewUrls={viewUrls}
      />
    </Suspense>
  );
}
