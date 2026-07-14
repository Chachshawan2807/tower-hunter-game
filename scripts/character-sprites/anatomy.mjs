import { C } from "./colors.mjs";

const SW = 0.65; // thin stroke reduces joint ghosting

export function shadow(cy = 186) {
  return `<ellipse cx="60" cy="${cy}" rx="26" ry="6" fill="${C.shadow}"/>`;
}

export function eyes(cy = 38, color = C.ink, spaced = 7) {
  return `<circle cx="${60 - spaced / 2}" cy="${cy}" r="1.6" fill="${color}"/>
  <circle cx="${60 + spaced / 2}" cy="${cy}" r="1.6" fill="${color}"/>`;
}

/**
 * ~8-head heroic core. Crown≈y26, soles≈y178.
 * Fills first + thin stroke to limit joint doubling.
 */
export function heroicCore(id, {
  torsoFill,
  legFill,
  armFill,
  bootFill,
  gloveFill,
  showSkinHands = true,
  showSkinFace = true,
} = {}) {
  const skin = `url(#${id}-skin)`;
  const hands = showSkinHands
    ? gloveFill ?? skin
    : gloveFill ?? armFill ?? torsoFill;
  const face = showSkinFace ? skin : torsoFill;
  const cloth = armFill ?? torsoFill;
  const pants = legFill ?? torsoFill;
  const boots = bootFill ?? pants;

  return `
  <path d="M47 58 C36 66 30 88 32 114 L40 116 C38 92 42 72 52 64 Z"
    fill="${cloth}" stroke="${C.ink}" stroke-width="${SW}"/>
  <circle cx="34" cy="118" r="6.5" fill="${hands}" stroke="${C.ink}" stroke-width="${SW}"/>
  <path d="M53 110 C48 130 47 152 49 170 L58 170 C56 150 56 128 59 112 Z"
    fill="${pants}" stroke="${C.ink}" stroke-width="${SW}"/>
  <ellipse cx="53" cy="174" rx="8" ry="4.5" fill="${boots}" stroke="${C.ink}" stroke-width="${SW}"/>
  <path d="M67 110 C72 130 73 152 71 170 L62 170 C64 150 64 128 61 112 Z"
    fill="${pants}" stroke="${C.ink}" stroke-width="${SW}"/>
  <ellipse cx="67" cy="174" rx="8" ry="4.5" fill="${boots}" stroke="${C.ink}" stroke-width="${SW}"/>
  <path d="M50 104 Q60 112 70 104 L68 116 Q60 122 52 116 Z"
    fill="${pants}" stroke="${C.ink}" stroke-width="${SW}"/>
  <path d="M48 54 Q60 46 72 54 L76 108 Q60 116 44 108 Z"
    fill="${torsoFill}" stroke="${C.ink}" stroke-width="${SW}"/>
  <path d="M73 58 C84 66 90 88 88 114 L80 116 C82 92 78 72 68 64 Z"
    fill="${cloth}" stroke="${C.ink}" stroke-width="${SW}"/>
  <circle cx="86" cy="118" r="6.5" fill="${hands}" stroke="${C.ink}" stroke-width="${SW}"/>
  <rect x="56.5" y="46" width="7" height="10" rx="2" fill="${face}" stroke="${C.ink}" stroke-width="${SW}"/>
  <ellipse cx="60" cy="38" rx="9" ry="10" fill="${face}" stroke="${C.ink}" stroke-width="${SW}"/>`;
}

export function hairCap(fill = C.hair) {
  return `<path d="M51 32 Q60 21 69 32 Q65 26 60 25 Q55 26 51 32 Z"
    fill="${fill}" stroke="${C.ink}" stroke-width="${SW}"/>`;
}
