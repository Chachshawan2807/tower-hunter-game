import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { PerspectiveCamera } from "three";

import {
  BATTLE_FIGHTER_CAMERA_FIT_MARGIN,
  BATTLE_FIGHTER_CAMERA_LOOK_Y,
  BATTLE_FIGHTER_FRAME_WIDTH,
  BATTLE_FIGHTER_SLOT_X,
} from "../../../engine/art/battleArenaLayout";
import { BATTLE_FIGHTER_TARGET_HEIGHT } from "../../../engine/art/battleFighterModels";

/** Frame both fighters centered on screen with equal vertical scale. */
export function BattleArenaCameraRig() {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;

    const margin = BATTLE_FIGHTER_CAMERA_FIT_MARGIN;
    const spanX = 2 * BATTLE_FIGHTER_SLOT_X + BATTLE_FIGHTER_FRAME_WIDTH;
    const spanY = BATTLE_FIGHTER_TARGET_HEIGHT * margin;
    const viewAspect =
      size.width > 0 && size.height > 0 ? size.width / size.height : 9 / 16;

    const vFovRad = (camera.fov * Math.PI) / 180;
    const distForHeight = (spanY * margin) / (2 * Math.tan(vFovRad / 2));
    const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * viewAspect);
    const distForWidth = (spanX * margin) / (2 * Math.tan(hFovRad / 2));
    const distance = Math.max(distForHeight, distForWidth, 3.2);

    const lookY = BATTLE_FIGHTER_CAMERA_LOOK_Y;
    camera.position.set(0, lookY, distance);
    camera.lookAt(0, lookY, 0);
    camera.near = 0.1;
    camera.far = Math.max(80, distance * 3);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}
