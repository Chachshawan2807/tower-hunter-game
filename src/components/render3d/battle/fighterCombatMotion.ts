import type { AnimationState } from "../../../engine/art/animationStates";
import type { FighterSide } from "./fighterPose";

const READY_DURATION_S = 0.32;
const ATTACK_DURATION_S = 0.42;
const HIT_DURATION_S = 0.38;

export interface CombatMotionOffset {
  x: number;
  z: number;
}

/** Procedural arena nudge layered on glTF clips (position only). */
export function combatMotionOffset(
  side: FighterSide,
  animState: AnimationState,
  elapsedSeconds: number
): CombatMotionOffset {
  const towardCenter = side === "player" ? 1 : -1;

  if (animState === "ready" && elapsedSeconds < READY_DURATION_S) {
    const t = elapsedSeconds / READY_DURATION_S;
    const lean = Math.sin(t * Math.PI);
    return {
      x: towardCenter * 0.14 * lean,
      z: -0.02 * lean,
    };
  }

  if (animState === "attack" && elapsedSeconds < ATTACK_DURATION_S) {
    const t = elapsedSeconds / ATTACK_DURATION_S;
    const lunge = Math.sin(Math.min(t * 1.65, 1) * Math.PI);
    return {
      x: towardCenter * 0.42 * lunge,
      z: -0.06 * lunge,
    };
  }

  if (animState === "hit_cc" && elapsedSeconds < HIT_DURATION_S) {
    const t = elapsedSeconds / HIT_DURATION_S;
    const recoil = (1 - t) * (1 - t);
    const wobble = Math.sin(t * Math.PI * 7) * 0.04 * (1 - t);
    return {
      x: -towardCenter * 0.28 * recoil + wobble,
      z: wobble * 0.5,
    };
  }

  return { x: 0, z: 0 };
}
