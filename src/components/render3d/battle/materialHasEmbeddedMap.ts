import { Mesh, MeshStandardMaterial } from "three";
import type { Object3D } from "three";

function standardMaterialHasMap(mat: unknown): boolean {
  return mat instanceof MeshStandardMaterial && mat.map != null;
}

/** True when the glTF ships albedo (or other) maps — skip runtime recolor / portrait overlay. */
export function modelHasEmbeddedTextures(root: Object3D): boolean {
  let found = false;
  root.traverse((obj) => {
    if (found || !(obj instanceof Mesh)) return;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    if (materials.some(standardMaterialHasMap)) found = true;
  });
  return found;
}
