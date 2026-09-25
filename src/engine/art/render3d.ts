/**
 * 3D presentation constants (framework-agnostic).
 * Consumed by `src/components/render3d/` — never import Three.js here.
 * @see docs/RENDER_3D.md
 */

import { ART_PALETTE } from "./palette";

export const RENDER_3D_ART = {
  backgroundHex: ART_PALETTE.inkBlack,
  floorHex: ART_PALETTE.primaryBlack,
  accentHex: ART_PALETTE.antiqueGold,
  dangerHex: ART_PALETTE.crimson,
  expHex: ART_PALETTE.darkYellow,
} as const;
