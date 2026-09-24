import { useEffect, useRef } from "react";
import { LoopOnce, LoopRepeat, type AnimationAction } from "three";

import {
  ANIMATION_STATE_SPECS,
  type AnimationState,
} from "../../../engine/art/animationStates";

type ActionsMap = Record<string, AnimationAction | null>;

export function useFighterGltfClip(
  animState: AnimationState,
  actions: ActionsMap | undefined
): void {
  const prevState = useRef<AnimationState | null>(null);

  useEffect(() => {
    if (!actions) return;

    const spec = ANIMATION_STATE_SPECS[animState];
    const action =
      actions[animState] ?? actions[spec.clipKey] ?? actions.idle ?? null;
    if (!action) return;

    if (prevState.current && prevState.current !== animState) {
      const prev = actions[prevState.current];
      prev?.fadeOut(0.12);
    }

    action.reset();
    action.setLoop(spec.loop ? LoopRepeat : LoopOnce, spec.loop ? Infinity : 1);
    action.clampWhenFinished = !spec.loop;
    action.fadeIn(0.1).play();

    prevState.current = animState;
  }, [animState, actions]);
}
