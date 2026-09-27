import type { BattleHeroViewId } from "../../../engine/art/battleHeroViews";

/** Pick turnaround texture from camera direction in the fighter's local horizontal plane. */
export function pickBattleHeroView(
  toCameraLocalX: number,
  toCameraLocalZ: number
): BattleHeroViewId {
  const f = toCameraLocalZ;
  const r = toCameraLocalX;

  if (f < -0.25) return "back";
  if (f > 0.55 && Math.abs(r) < 0.35) return "front";
  if (f > 0.15 && r > 0.12) return "threeQuarter";
  if (f > 0.15 && r < -0.12) return "threeQuarter";
  if (Math.abs(r) > Math.max(Math.abs(f), 0.2)) return "side";
  if (f > 0) return "threeQuarter";
  return "back";
}

export function shouldFlipSideView(toCameraLocalX: number): boolean {
  return toCameraLocalX < 0;
}
