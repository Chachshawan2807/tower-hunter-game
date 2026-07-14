/**
 * Tower Hunter — Color Bible (Unified Palette)
 * @see docs/art-bible/MASTER_ART_BIBLE.md §02
 */

export const ART_PALETTE = {
  /** Pure Black — all UI text, high visibility */
  inkBlack: "#000000",

  /** Primary Black range — backgrounds, overlay bases */
  primaryBlackDeep: "#0D0D0D",
  primaryBlack: "#1A1A1A",

  /** Crimson Red — enemy HP, DoT, critical damage */
  crimsonDeep: "#8B0000",
  crimson: "#B22222",

  /** Dark Yellow — Murim skills, dim tower light, EXP */
  darkYellow: "#DAA520",
  darkYellowDeep: "#B8860B",

  /** Antique Gold — currency, Rare+ items, settings icon */
  antiqueGold: "#C5A059",
  antiqueGoldDeep: "#996515",

  /** Natural skin tone reference (character bible baseline) */
  skinLight: "#d4b896",
  skinMid: "#c49a6c",
  skinShadow: "#8b6914",
} as const;

export type ArtPaletteKey = keyof typeof ART_PALETTE;
