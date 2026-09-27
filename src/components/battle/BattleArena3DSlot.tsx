import { lazy, Suspense } from "react";

import type { AnimationState } from "../../engine/art/animationStates";

const BattleArena3D = lazy(() =>
  import("../render3d/battle/BattleArena3D").then((m) => ({
    default: m.BattleArena3D,
  }))
);

type BattleArena3DSlotProps = {
  floor: number;
  playerAnim: AnimationState;
  enemyAnim: AnimationState;
  battleSessionKey?: string | null;
};

export function BattleArena3DSlot({
  floor,
  playerAnim,
  enemyAnim,
  battleSessionKey,
}: BattleArena3DSlotProps) {
  return (
    <Suspense fallback={null}>
      <BattleArena3D
        floor={floor}
        playerAnim={playerAnim}
        enemyAnim={enemyAnim}
        battleSessionKey={battleSessionKey}
      />
    </Suspense>
  );
}
