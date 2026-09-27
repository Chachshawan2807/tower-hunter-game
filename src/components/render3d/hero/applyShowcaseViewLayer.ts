import type { Mesh, MeshBasicMaterial, Texture } from "three";

import type { BattleHeroViewId } from "../../../engine/art/battleHeroViews";
import { heroViewPlaneSize, type HeroBillboardPresentation } from "./heroViewPlaneSize";

export function applyShowcaseViewLayer(
  mesh: Mesh,
  mat: MeshBasicMaterial,
  viewId: BattleHeroViewId,
  flipX: boolean,
  opacity: number,
  textures: Record<BattleHeroViewId, Texture>,
  presentation: HeroBillboardPresentation,
  basePlane: { width: number; height: number },
  scaleMul: number
): void {
  const viewPlane = heroViewPlaneSize(textures[viewId], presentation);
  const nextMap = textures[viewId];
  if (mat.map !== nextMap) {
    mat.map = nextMap;
    mat.needsUpdate = true;
  }

  const widthScale =
    (viewPlane.width / basePlane.width) * (flipX ? -1 : 1) * scaleMul;
  mesh.scale.set(widthScale, scaleMul, 1);
  mesh.position.y = (viewPlane.height * scaleMul) / 2;
  mat.opacity = opacity;
}
