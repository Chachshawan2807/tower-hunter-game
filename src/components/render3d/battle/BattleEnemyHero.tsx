import type { AnimationState } from "../../../engine/art/animationStates";
import { BattleFighterTurnaround } from "./BattleFighterTurnaround";

type BattleEnemyHeroProps = {
  animState: AnimationState;
};

export function BattleEnemyHero({ animState }: BattleEnemyHeroProps) {
  return <BattleFighterTurnaround side="enemy" animState={animState} />;
}
