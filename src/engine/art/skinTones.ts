/**
 * Character Bible — natural skin tone palette (not washed out, not background-melting)
 * @see docs/art-bible/MASTER_ART_BIBLE.md §06
 */

export const SKIN_TONES = {
  highlight: "#e8c9a8",
  base: "#c49a6c",
  shadow: "#8b6914",
  contour: "#5c4020",
} as const;

export const SKIN_CSS_VARS = {
  "--skin-highlight": SKIN_TONES.highlight,
  "--skin-base": SKIN_TONES.base,
  "--skin-shadow": SKIN_TONES.shadow,
  "--skin-contour": SKIN_TONES.contour,
} as const;
