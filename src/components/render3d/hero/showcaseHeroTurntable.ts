import type { BattleHeroViewId } from "../../../engine/art/battleHeroViews";
import {
  pickBattleHeroView,
  shouldFlipSideView,
} from "../battle/pickBattleHeroView";

const TAU = Math.PI * 2;

/** Orbit speed while pointer is held (about one turn every 22s). */
export const SHOWCASE_HOLD_RAD_PER_SEC = TAU / 22;

/** One click advances to the next turnaround sector (45°). */
export const SHOWCASE_CLICK_STEP_RAD = Math.PI / 4;

export const SHOWCASE_CLICK_MAX_MS = 220;
export const SHOWCASE_CLICK_MAX_MOVE_PX = 10;

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
