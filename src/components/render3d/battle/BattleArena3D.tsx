import { lazy, Suspense } from "react";

import type { AnimationState } from "../../../engine/art/animationStates";
import { isBattle3dEnabled } from "../../../utils/render3dEnv";

const BattleArena3DLayer = lazy(() =>
  import("./BattleArena3DLayer").then((m) => ({ default: m.BattleArena3DLayer }))
);

type BattleArena3DProps = {
  floor: number;
  playerAnim: AnimationState;
  enemyAnim: AnimationState;
};

export function BattleArena3D(props: BattleArena3DProps) {
  if (!isBattle3dEnabled()) return null;

  return (
    <Suspense fallback={null}>
      <BattleArena3DLayer {...props} />
    </Suspense>
  );
}
