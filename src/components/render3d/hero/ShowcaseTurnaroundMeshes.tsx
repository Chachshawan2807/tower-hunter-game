import type { AnimationState } from "../../../engine/art/animationStates";
import type { BattleHeroViewId } from "../../../engine/art/battleHeroViews";
import type { Texture } from "three";
import { type HeroBillboardPresentation } from "./heroViewPlaneSize";
import { TurnaroundHeroSingleMesh } from "./TurnaroundHeroSingleMesh";

type ShowcaseTurnaroundMeshesProps = {
  animState: AnimationState;
  presentation: HeroBillboardPresentation;
  textures: Record<BattleHeroViewId, Texture>;
  basePlane: { width: number; height: number };
};

export function ShowcaseTurnaroundMeshes(props: ShowcaseTurnaroundMeshesProps) {
  return <TurnaroundHeroSingleMesh {...props} />;
}
