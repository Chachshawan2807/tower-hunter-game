/**
 * Shared battle fighter glTF (clips + mesh). View tints per side.
 * @see public/models/battle-fighter.glb
 */

export const BATTLE_FIGHTER_GLB_URL = "/models/battle-fighter.glb";

/** glTF animation names — match `AnimationState` ids. */
export const BATTLE_FIGHTER_CLIP_NAMES = [
  "idle",
  "attack",
  "hit_cc",
  "defeat",
] as const;

/** Target height in world units after normalization (feet on y=0). */
export const BATTLE_FIGHTER_TARGET_HEIGHT = 1.35;
