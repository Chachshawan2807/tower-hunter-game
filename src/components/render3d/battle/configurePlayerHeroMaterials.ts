import type { Group } from "three";

import { applyAuthoredHeroMaterials } from "./applyAuthoredHeroMaterials";

/** Modeler GLB — keeps embedded PBR maps (no palette tint). */
export function configurePlayerHeroMaterials(root: Group): void {
  applyAuthoredHeroMaterials(root);
}
