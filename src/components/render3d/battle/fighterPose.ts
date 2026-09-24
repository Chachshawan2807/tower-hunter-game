import type { AnimationState } from "../../../engine/art/animationStates";

export type FighterSide = "player" | "enemy";

export interface FighterPose {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  scale: number;
}

const BASE_Y = 0.75;
const PLAYER_X = -1.45;
const ENEMY_X = 1.45;

function basePose(side: FighterSide): FighterPose {
  return {
    x: side === "player" ? PLAYER_X : ENEMY_X,
    y: BASE_Y,
    z: 0,
    rotX: 0,
    rotY: side === "player" ? Math.PI / 2 : -Math.PI / 2,
    scale: 1,
  };
}

/** Target transforms for each sprite animation state (presentation only). */
export function poseForAnimationState(
  state: AnimationState,
  side: FighterSide
): FighterPose {
  const base = basePose(side);
  const towardCenter = side === "player" ? 1 : -1;

  switch (state) {
    case "attack":
      return {
        ...base,
        x: base.x + towardCenter * 0.55,
        z: towardCenter * 0.15,
      };
    case "hit_cc":
      return {
        ...base,
        x: base.x - towardCenter * 0.35,
        rotX: -0.35 * towardCenter,
        z: -towardCenter * 0.1,
      };
    case "defeat":
      return {
        ...base,
        y: 0.35,
        rotX: -Math.PI / 2.2,
        scale: 0.85,
      };
    case "idle":
    default:
      return base;
  }
}
