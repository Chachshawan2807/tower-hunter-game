import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { useThree } from "@react-three/fiber";

import { BATTLE_ENEMY_DEFAULT_TURN_YAW } from "../../../engine/art/battleEnemyTurnaround";
import { BATTLE_PLAYER_DEFAULT_TURN_YAW } from "../../../engine/art/battleHeroTurnaround";
import { TurntablePointerSurface } from "../hero/TurntablePointerSurface";
import type { FighterSide } from "./fighterPose";

type BattleTurntableContextValue = {
  yawRefForSide: (side: FighterSide) => MutableRefObject<number>;
};

export const BattleTurntableContext = createContext<BattleTurntableContextValue | null>(
  null
);

export function useBattleTurntableYawRef(side: FighterSide): MutableRefObject<number> {
  const ctx = useContext(BattleTurntableContext);
  if (!ctx) {
    throw new Error("useBattleTurntableYawRef requires BattleTurntableProvider");
  }
  return ctx.yawRefForSide(side);
}

function BattleTurntablePointerSurface() {
  const ctx = useContext(BattleTurntableContext);
  const { gl } = useThree();

  const resolveYawRef = useCallback(
    (event: PointerEvent) => {
      if (!ctx) return null;
      const rect = gl.domElement.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      const side: FighterSide = event.clientX < mid ? "player" : "enemy";
      return ctx.yawRefForSide(side);
    },
    [ctx, gl]
  );

  return <TurntablePointerSurface resolveYawRef={resolveYawRef} />;
}

export function BattleTurntableProvider({ children }: { children: ReactNode }) {
  const playerYawRef = useRef(BATTLE_PLAYER_DEFAULT_TURN_YAW);
  const enemyYawRef = useRef(BATTLE_ENEMY_DEFAULT_TURN_YAW);

  const value = useMemo(
    (): BattleTurntableContextValue => ({
      yawRefForSide: (side) => (side === "player" ? playerYawRef : enemyYawRef),
    }),
    []
  );

  return (
    <BattleTurntableContext.Provider value={value}>
      <BattleTurntablePointerSurface />
      {children}
    </BattleTurntableContext.Provider>
  );
}
