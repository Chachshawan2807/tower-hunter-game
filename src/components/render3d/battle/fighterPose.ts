import type { AnimationState } from "../../../engine/art/animationStates";
import {
  BATTLE_FIGHTER_SLOT_X,
  BATTLE_PLAYER_SLOT_X_NUDGE,
} from "../../../engine/art/battleArenaLayout";

export type FighterSide = "player" | "enemy";

export interface FighterSlotPose {
  x: number;
  y: number;
  z: number;
  rotY: number;
}

/** Arena slot only — combat motion comes from glTF clips. */
export function slotPoseForSide(side: FighterSide): FighterSlotPose {
  return {
    x:
      side === "player"
        ? -BATTLE_FIGHTER_SLOT_X + BATTLE_PLAYER_SLOT_X_NUDGE
        : BATTLE_FIGHTER_SLOT_X,
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
