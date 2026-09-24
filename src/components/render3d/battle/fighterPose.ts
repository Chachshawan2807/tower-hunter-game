import type { AnimationState } from "../../../engine/art/animationStates";

export type FighterSide = "player" | "enemy";

export interface FighterSlotPose {
  x: number;
  y: number;
  z: number;
  rotY: number;
}

const PLAYER_X = -1.45;
const ENEMY_X = 1.45;

/** Arena slot only — combat motion comes from glTF clips. */
export function slotPoseForSide(side: FighterSide): FighterSlotPose {
  return {
    x: side === "player" ? PLAYER_X : ENEMY_X,
    y: 0,
    z: 0,
    rotY: side === "player" ? Math.PI / 2 : -Math.PI / 2,
  };
}

/** @deprecated Use slotPoseForSide — kept for battle index exports */
export function poseForAnimationState(
  _state: AnimationState,
  side: FighterSide
): FighterSlotPose & { rotX: number; scale: number } {
  const slot = slotPoseForSide(side);
  return { ...slot, rotX: 0, scale: 1 };
}
