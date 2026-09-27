import { Mesh, MeshStandardMaterial, SRGBColorSpace } from "three";
import type { Object3D } from "three";

import { RENDER_3D_ART } from "../../../engine/art/render3d";

function prepareStandardMaterial(mat: MeshStandardMaterial, meshName: string): MeshStandardMaterial {
  const out = mat.clone();
  if (out.map) {
    out.map.colorSpace = SRGBColorSpace;
    out.color.set("#ffffff");
    out.metalness = out.metalness ?? 0.35;
    out.roughness = out.roughness ?? 0.55;
    return out;
  }
  if (meshName === "Weapon") {
    out.color.set(RENDER_3D_ART.expHex);
    return out;
  }
  return out;
}

/** Modeler-delivered battle-hero.glb — keep PBR maps; optional Weapon name tint if untextured. */
export function applyAuthoredHeroMaterials(root: Object3D): void {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    if (Array.isArray(obj.material)) {
      obj.material = obj.material.map((m) =>
        m instanceof MeshStandardMaterial ? prepareStandardMaterial(m, obj.name) : m
      );
      return;
    }
    if (obj.material instanceof MeshStandardMaterial) {
      obj.material = prepareStandardMaterial(obj.material, obj.name);
    }
  });
}
