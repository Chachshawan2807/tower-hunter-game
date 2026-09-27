/**
 * Multi-view battle enemy textures (Shacklebound Warden turnaround).
 * @see public/assets/characters/battle-enemy/
 */

export const BATTLE_ENEMY_VIEW_URLS = {
  front: "/assets/characters/battle-enemy/battle-enemy-front.png",
  back: "/assets/characters/battle-enemy/battle-enemy-back.png",
  side: "/assets/characters/battle-enemy/battle-enemy-side.png",
  threeQuarter: "/assets/characters/battle-enemy/battle-enemy-three-quarter.png",
} as const;

export type BattleEnemyViewId = keyof typeof BATTLE_ENEMY_VIEW_URLS;
