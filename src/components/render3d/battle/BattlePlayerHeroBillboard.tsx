import type { AnimationState } from "../../../engine/art/animationStates";
import { InkKnightTurnaroundBillboard } from "../hero/InkKnightTurnaroundBillboard";

type BattlePlayerHeroBillboardProps = {
  animState: AnimationState;
};

/** Battle arena — same ink turnaround as home showcase. */
export function BattlePlayerHeroBillboard({ animState }: BattlePlayerHeroBillboardProps) {
  return <InkKnightTurnaroundBillboard animState={animState} presentation="battle" />;
}
