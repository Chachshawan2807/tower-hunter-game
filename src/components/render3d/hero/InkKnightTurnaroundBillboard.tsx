import { InkKnightBattleTurnaround } from "./InkKnightBattleTurnaround";
import { InkKnightShowcaseBillboard } from "./InkKnightShowcaseBillboard";
import type { HeroBillboardPresentation } from "./heroViewPlaneSize";
import type { AnimationState } from "../../../engine/art/animationStates";

export type InkKnightPresentation = HeroBillboardPresentation;

export type InkKnightTurnaroundBillboardProps = {
  animState?: AnimationState;
  presentation: InkKnightPresentation;
};

export function InkKnightTurnaroundBillboard({
  animState = "idle",
  presentation,
}: InkKnightTurnaroundBillboardProps) {
  if (presentation === "showcase") {
    return <InkKnightShowcaseBillboard animState={animState} />;
  }

  return <InkKnightBattleTurnaround animState={animState} />;
}
