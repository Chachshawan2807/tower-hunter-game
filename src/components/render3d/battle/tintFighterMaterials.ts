import { Mesh, MeshStandardMaterial, SRGBColorSpace } from "three";
import type { Object3D } from "three";

import { RENDER_3D_ART } from "../../../engine/art/render3d";
import type { FighterSide } from "./fighterPose";

export type TintFighterOptions = {
  /** Keep glTF albedo maps at white; still tints untextured meshes (e.g. placeholder). */
  preserveTexturedMeshes?: boolean;
};

function tintForMesh(name: string, side: FighterSide): string {
  if (name === "Weapon") {
    return side === "player" ? RENDER_3D_ART.expHex : RENDER_3D_ART.dangerHex;
  }
  return side === "player" ? RENDER_3D_ART.accentHex : RENDER_3D_ART.dangerHex;
}

function tintStandardMaterial(
  mat: MeshStandardMaterial,
  meshName: string,
  side: FighterSide,
  options?: TintFighterOptions
): MeshStandardMaterial {
  const cloned = mat.clone();
  if (options?.preserveTexturedMeshes && cloned.map) {
    cloned.map.colorSpace = SRGBColorSpace;
    cloned.color.set("#ffffff");
    return cloned;
  }
  cloned.color.set(tintForMesh(meshName, side));
  return cloned;
}

export function tintFighterMaterials(
  root: Object3D,
  side: FighterSide,
  options?: TintFighterOptions
): void {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    if (Array.isArray(obj.material)) {
      obj.material = obj.material.map((m) =>
        m instanceof MeshStandardMaterial
          ? tintStandardMaterial(m, obj.name, side, options)
          : m
      );
      return;
    }
    if (obj.material instanceof MeshStandardMaterial) {
      obj.material = tintStandardMaterial(obj.material, obj.name, side, options);
    }
  });
}
