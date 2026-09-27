import { useCallback, useRef } from "react";

import type { BattleHeroViewId } from "../../../engine/art/battleHeroViews";

const MIN_HOLD_SEC = 0.35;

/** Avoid rapid view swaps that flash empty alpha on turnaround PNGs. */
export function useStableHeroView() {
  const lastView = useRef<BattleHeroViewId>("front");
  const lastChangeAt = useRef(0);

  return useCallback((candidate: BattleHeroViewId, elapsed: number): BattleHeroViewId => {
    if (candidate === lastView.current) return candidate;
    if (elapsed - lastChangeAt.current < MIN_HOLD_SEC) {
      return lastView.current;
    }
    lastView.current = candidate;
    lastChangeAt.current = elapsed;
    return candidate;
  }, []);
}
