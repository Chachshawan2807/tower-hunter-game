import type { BattleHeroViewId } from "./battleHeroViews";

/**
 * Canonical battle turntable opening stance (do not change without new art refs).
 *
 * Camera orbit +Y; yaw `0` = front sector for both fighters (separate texture sets).
 * - Player: `battle-hero-front.png` — 3/4 toward screen right.
 * - Enemy: `battle-enemy-front.png` — full front toward camera.
 *
 * Applied on every mount and when `battleSessionKey` changes
 * (`BattleTurntableProvider` + `BattleArena3DSlot` remount).
 */
export const BATTLE_PLAYER_DEFAULT_TURN_YAW = 0;

export const BATTLE_ENEMY_DEFAULT_TURN_YAW = 0;

export type BattleOpeningView = {
  viewId: BattleHeroViewId;
  flipX: boolean;
};

/** Expected discrete view at each fighter's default yaw (turntable math). */
export const BATTLE_OPENING_VIEW: Record<"player" | "enemy", BattleOpeningView> = {
  player: { viewId: "front", flipX: false },
  enemy: { viewId: "front", flipX: false },
};
