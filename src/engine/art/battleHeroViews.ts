/**
 * Multi-view battle hero textures (ink knight turnaround → WebGL planes).
 * @see public/assets/characters/battle-hero/
 */

export const BATTLE_HERO_VIEW_URLS = {
  front: "/assets/characters/battle-hero/battle-hero-front.png",
  back: "/assets/characters/battle-hero/battle-hero-back.png",
  side: "/assets/characters/battle-hero/battle-hero-side.png",
  threeQuarter: "/assets/characters/battle-hero/battle-hero-three-quarter.png",
} as const;

export type BattleHeroViewId = keyof typeof BATTLE_HERO_VIEW_URLS;
