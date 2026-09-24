import { Mesh, MeshStandardMaterial } from "three";
import type { Object3D } from "three";

import { RENDER_3D_ART } from "../../../engine/art/render3d";
import type { FighterSide } from "./fighterPose";

function tintForMesh(name: string, side: FighterSide): string {
  if (name === "Weapon") {
    return side === "player" ? RENDER_3D_ART.expHex : RENDER_3D_ART.dangerHex;
  }
  return side === "player" ? RENDER_3D_ART.accentHex : RENDER_3D_ART.dangerHex;
}

export function tintFighterMaterials(root: Object3D, side: FighterSide): void {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    const tint = (mat: MeshStandardMaterial) => {
      const cloned = mat.clone();
      cloned.color.set(tintForMesh(obj.name, side));
      return cloned;
    };
    if (Array.isArray(obj.material)) {
      obj.material = obj.material.map((m) => tint(m as MeshStandardMaterial));
      return;
    }
    obj.material = tint(obj.material as MeshStandardMaterial);
  });
}
