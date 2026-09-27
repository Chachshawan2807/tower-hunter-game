import type { Mesh, MeshBasicMaterial, Texture } from "three";

import type { BattleHeroViewId } from "../../../engine/art/battleHeroViews";
import { heroViewPlaneSize, type HeroBillboardPresentation } from "./heroViewPlaneSize";
import type { TurnaroundTextureAnchor } from "./turnaroundTextureAnchor";

export function applyShowcaseViewLayer(
  mesh: Mesh,
  mat: MeshBasicMaterial,
  viewId: BattleHeroViewId,
  flipX: boolean,
  opacity: number,
  textures: Record<BattleHeroViewId, Texture>,
  presentation: HeroBillboardPresentation,
  basePlane: { width: number; height: number },
  scaleMul: number,
  anchor: TurnaroundTextureAnchor = { centerXNorm: 0.5, footYNorm: 1 }
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

  const planeH = basePlane.height * scaleMul;
  const footGap = (1 - anchor.footYNorm) * planeH;
  mesh.position.y = planeH / 2 - footGap;
  let offsetX = (anchor.centerXNorm - 0.5) * viewPlane.width * scaleMul;
  if (flipX) offsetX *= -1;
  mesh.position.x = offsetX;

  mat.opacity = opacity;
}
