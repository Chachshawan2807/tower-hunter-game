import { BATTLE_PLAYER_DEFAULT_TURN_YAW } from "./battleHeroTurnaround";

/** 3/4 toward the player (enemy stands on the right). */
export const BATTLE_ENEMY_DEFAULT_TURN_YAW =
  Math.PI - BATTLE_PLAYER_DEFAULT_TURN_YAW;
