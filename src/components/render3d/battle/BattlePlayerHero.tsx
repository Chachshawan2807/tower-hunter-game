import type { AnimationState } from "../../../engine/art/animationStates";
import { BATTLE_HERO_GLTF_AUTHORED } from "../../../engine/art/battleFighterModels";
import { BattleFighterMesh } from "./BattleFighterMesh";
import { BattlePlayerHeroBillboard } from "./BattlePlayerHeroBillboard";

type BattlePlayerHeroProps = {
  animState: AnimationState;
};

/**
 * Modeler GLB (`BATTLE_HERO_GLTF_AUTHORED`) → mesh. Otherwise ink turnaround billboards.
 */
export function BattlePlayerHero({ animState }: BattlePlayerHeroProps) {
  if (!BATTLE_HERO_GLTF_AUTHORED) {
    return <BattlePlayerHeroBillboard animState={animState} />;
  }

  return <BattleFighterMesh side="player" animState={animState} playerHeroGltf />;
}
