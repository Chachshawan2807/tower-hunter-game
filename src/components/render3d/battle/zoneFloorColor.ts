import { RENDER_3D_ART } from "../../../engine/art/render3d";

/** Battle arena floor matches scene background for a uniform ink-black stage. */
export function floorColorForBattle(_floor: number): string {
  return RENDER_3D_ART.backgroundHex;
}
