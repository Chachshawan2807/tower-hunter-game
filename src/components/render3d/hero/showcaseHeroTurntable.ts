import type { BattleHeroViewId } from "../../../engine/art/battleHeroViews";
import {
  pickBattleHeroView,
  shouldFlipSideView,
} from "../battle/pickBattleHeroView";

const TAU = Math.PI * 2;

/** Horizontal drag sensitivity (radians per screen pixel). */
export const SHOWCASE_DRAG_RAD_PER_PX = 0.014;

export function normalizeShowcaseYaw(yaw: number): number {
  return ((yaw % TAU) + TAU) % TAU;
}

function showcaseFlipForView(viewId: BattleHeroViewId, orbitLocalX: number): boolean {
  if (viewId === "side") return shouldFlipSideView(orbitLocalX);
  if (viewId === "threeQuarter") return orbitLocalX < 0;
  return false;
}

/**
 * One discrete turnaround sprite for the current orbit angle (no layered crossfade).
 * `yaw` is camera orbit around +Y: 0 = front, increasing = orbit to the right.
 */
export function showcaseViewFromYaw(yaw: number): {
  viewId: BattleHeroViewId;
  flipX: boolean;
} {
  const theta = normalizeShowcaseYaw(yaw);
  const orbitLocalX = Math.sin(theta);
  const orbitLocalZ = Math.cos(theta);
  const viewId = pickBattleHeroView(orbitLocalX, orbitLocalZ);
  return {
    viewId,
    flipX: showcaseFlipForView(viewId, orbitLocalX),
  };
}
