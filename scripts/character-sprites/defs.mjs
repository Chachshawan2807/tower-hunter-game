import { C } from "./colors.mjs";

/** SVG gradient / filter defs scoped by archetype id prefix */
export function defs(id) {
  return `<defs>
  <radialGradient id="${id}-skin" cx="38%" cy="28%" r="68%">
    <stop offset="0%" stop-color="${C.skinHi}"/>
    <stop offset="55%" stop-color="${C.skin}"/>
    <stop offset="100%" stop-color="${C.skinLo}"/>
  </radialGradient>
  <linearGradient id="${id}-metal" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${C.metalHi}"/>
    <stop offset="48%" stop-color="${C.metal}"/>
    <stop offset="100%" stop-color="${C.metalLo}"/>
  </linearGradient>
  <radialGradient id="${id}-demon" cx="35%" cy="25%" r="70%">
    <stop offset="0%" stop-color="${C.demonHi}"/>
    <stop offset="100%" stop-color="${C.demon}"/>
  </radialGradient>
  <linearGradient id="${id}-fur" x1="0.2" y1="0" x2="0.8" y2="1">
    <stop offset="0%" stop-color="${C.beastFurHi}"/>
    <stop offset="100%" stop-color="${C.beastFur}"/>
  </linearGradient>
  <filter id="${id}-soft" x="-12%" y="-12%" width="124%" height="124%">
    <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity="0.35"/>
  </filter>
</defs>`;
}
