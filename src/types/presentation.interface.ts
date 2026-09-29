/**
 * View-layer presentation modes. Combat logic and snapshots are unchanged.
 * @see docs/RENDER_3D.md
 */

/** Battle arena character rendering (sprites vs WebGL fighters). */
export type BattlePresentationMode = "2d" | "3d";

/** Reserved for future tower zone backgrounds (2D art vs WebGL environment). */
export type TowerZonePresentationMode = "2d" | "3d" | "hybrid";
