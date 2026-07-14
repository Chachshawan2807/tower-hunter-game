/**
 * Tower Hunter — Character animation states (JSON Queue / 2D View)
 * @see docs/art-bible/MASTER_ART_BIBLE.md §06
 */

export const ANIMATION_STATES = [
  "idle",
  "attack",
  "hit_cc",
  "defeat",
] as const;

export type AnimationState = (typeof ANIMATION_STATES)[number];

export interface AnimationStateSpec {
  id: AnimationState;
  /** Sprite sheet row / clip id for future asset binding */
  clipKey: string;
  loop: boolean;
  description: string;
}

export const ANIMATION_STATE_SPECS: Record<AnimationState, AnimationStateSpec> = {
  idle: {
    id: "idle",
    clipKey: "char_idle",
    loop: true,
    description: "Combat-ready stance, slow breath, subtle weapon sway",
  },
  attack: {
    id: "attack",
    clipKey: "char_attack",
    loop: false,
    description: "Fast strike with forward momentum keyframes",
  },
  hit_cc: {
    id: "hit_cc",
    clipKey: "char_hit_cc",
    loop: false,
    description: "Stagger, stun, or freeze overlay — character freezes or recoils",
  },
  defeat: {
    id: "defeat",
    clipKey: "char_defeat",
    loop: false,
    description: "Collapse then dissolve into black smoke",
  },
};

export function isAnimationState(value: string): value is AnimationState {
  return (ANIMATION_STATES as readonly string[]).includes(value);
}
