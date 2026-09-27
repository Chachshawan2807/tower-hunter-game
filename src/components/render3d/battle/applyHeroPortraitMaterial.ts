import {
  BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  type BufferGeometry,
  type Object3D,
  type Texture,
} from "three";

import { BATTLE_FIGHTER_TARGET_HEIGHT } from "../../../engine/art/battleFighterModels";
import { RENDER_3D_ART } from "../../../engine/art/render3d";

const HERO_WIDTH = BATTLE_FIGHTER_TARGET_HEIGHT * 0.42;

export function assignFrontPlanarUvs(geometry: BufferGeometry): void {
  const pos = geometry.attributes.position;
  if (!pos) return;
  const uv = new Float32Array(pos.count * 2);
  const h = BATTLE_FIGHTER_TARGET_HEIGHT;
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / HERO_WIDTH + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / h;
  }
  geometry.setAttribute("uv", new BufferAttribute(uv, 2));
}

export function applyHeroPortraitMaterial(root: Object3D, portrait: Texture): void {
  portrait.colorSpace = SRGBColorSpace;
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    if (obj.name === "Weapon") {
      const weaponMat = new MeshStandardMaterial({
        color: RENDER_3D_ART.expHex,
        metalness: 0.55,
        roughness: 0.4,
      });
      obj.material = weaponMat;
      return;
    }
    const geo = obj.geometry as BufferGeometry;
    assignFrontPlanarUvs(geo);
    obj.material = new MeshStandardMaterial({
      map: portrait,
      metalness: 0.15,
      roughness: 0.88,
      transparent: true,
      alphaTest: 0.06,
    });
  });
}
