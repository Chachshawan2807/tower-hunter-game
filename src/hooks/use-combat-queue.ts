import { useAnimationQueue, type AnimationSpeed } from "./useAnimationQueue";

export type { AnimationSpeed };

/**
 * Blueprint hook — bridges TurnResolutionResult animation queues to React state.
 * Wraps useAnimationQueue for combat presentation.
 */
export function useCombatQueue(
  options: Parameters<typeof useAnimationQueue>[0] = {}
) {
  return useAnimationQueue(options);
}

export type UseCombatQueueReturn = ReturnType<typeof useCombatQueue>;
