import { BATTLE_FIGHTER_TARGET_HEIGHT } from "./battleFighterModels";

/** Matches imperial-knight hero portrait (413×985). */
const HERO_PORTRAIT_ASPECT = 413 / 985;

/** Horizontal offset from arena center to each fighter (feet at y = 0). */
export const BATTLE_FIGHTER_SLOT_X = 0.56;

/** Nudge player toward screen center (+X) without moving the enemy slot. */
export const BATTLE_PLAYER_SLOT_X_NUDGE = 0.1;

/** Vertical focus for battle camera (between feet and head). */
export const BATTLE_FIGHTER_CAMERA_LOOK_Y = BATTLE_FIGHTER_TARGET_HEIGHT * 0.42;

/** Padding when fitting both fighters in the viewport. */
export const BATTLE_FIGHTER_CAMERA_FIT_MARGIN = 1.16;

/** Max horizontal footprint per fighter at battle scale (portrait plane width). */
export const BATTLE_FIGHTER_FRAME_WIDTH =
  BATTLE_FIGHTER_TARGET_HEIGHT * HERO_PORTRAIT_ASPECT;

export type BattleFighterSide = "player" | "enemy";

/** World point each fighter should look at (opponent torso). */
export function opponentLookTarget(side: BattleFighterSide): {
  x: number;
  y: number;
  z: number;
} {
  return {
    x: side === "player" ? BATTLE_FIGHTER_SLOT_X : -BATTLE_FIGHTER_SLOT_X,
    y: BATTLE_FIGHTER_CAMERA_LOOK_Y,
    z: 0,
  };
}
