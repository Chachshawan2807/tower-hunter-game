import type { AnimationState } from "../../../engine/art/animationStates";
import { BattleFighterTurnaround } from "../battle/BattleFighterTurnaround";

type InkKnightBattleTurnaroundProps = {
  animState: AnimationState;
};

export function InkKnightBattleTurnaround({ animState }: InkKnightBattleTurnaroundProps) {
  return <BattleFighterTurnaround side="player" animState={animState} />;
}
