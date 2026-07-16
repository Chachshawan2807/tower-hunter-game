/**

 * Character sprite sheet layout — Art Bible §06

 * Isometric chibi reference style (4×4 grid: rows = animation states)

 */



import type { AnimationState } from "../animationStates";

import type { CharacterArchetype, CharacterSheetId } from "../characters/types";

import { CHARACTER_ARCHETYPES } from "../characters/types";



export type { CharacterSheetId };



export const SPRITE_SCALE = 2;

/** Logical frame size at 1× — multiplied by SPRITE_SCALE for PNG assets */
export const SPRITE_FRAME_WIDTH = 120 * SPRITE_SCALE;

export const SPRITE_FRAME_HEIGHT = 200 * SPRITE_SCALE;

export const SPRITE_FRAMES_PER_ROW = 4;



export const ANIMATION_STATE_ROW: Record<AnimationState, number> = {

  idle: 0,

  attack: 1,

  hit_cc: 2,

  defeat: 3,

};



export const CHARACTER_SHEET_URLS: Record<CharacterSheetId, string> = {
  imperial: "/assets/characters/knight-sheet.png",
  knight: "/assets/characters/knight-sheet.png",
  vanguard: "/assets/characters/fantasy-sheet.png",
  beast: "/assets/characters/beast-sheet.png",
  demon: "/assets/characters/demon-sheet.png",
  merchant: "/assets/characters/merchant-sheet.png",
  villager: "/assets/characters/villager-sheet.png",
};

/** Main player hero — Imperial Knight line art (transparent SVG) */
export const PLAYER_HERO_PORTRAIT_URL = "/assets/characters/imperial-knight-hero.svg";



export function sheetIdForArchetype(archetype: CharacterArchetype): CharacterSheetId {

  return CHARACTER_ARCHETYPES[archetype].sheetId;

}



export function sheetIdForPath(

  path: "imperial" | "knight" | "vanguard",

  side: "player" | "enemy"

): CharacterSheetId {

  if (side === "enemy") return "beast";

  return path;

}

