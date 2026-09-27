/**
 * Shared battle fighter glTF (clips + mesh). View tints per side.
 * @see public/models/battle-fighter.glb
 */

export const BATTLE_FIGHTER_GLB_URL = "/models/battle-fighter.glb";

/** Player hero mesh from turnaround PNGs (`npm run generate:battle-hero`). */
export const BATTLE_HERO_GLB_URL = "/models/battle-hero.glb";

/**
 * Set `true` after replacing `battle-hero.glb` with a textured modeler export.
 * While `false`, battle uses ink turnaround billboards (not the procedural hull GLB).
 */
export const BATTLE_HERO_GLTF_AUTHORED = false;

/** glTF animation names — match `AnimationState` ids. */
export const BATTLE_FIGHTER_CLIP_NAMES = [
  "idle",
  "attack",
  "hit_cc",
  "defeat",
] as const;

/** Target height in world units after normalization (feet on y=0). */
export const BATTLE_FIGHTER_TARGET_HEIGHT = 1.35;
