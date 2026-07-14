import { C } from "../colors.mjs";
import { heroicCore, shadow } from "../anatomy.mjs";

/** Knight — full plate, cape, bucket helm, shield */
export function knightBody(id) {
  const metal = `url(#${id}-metal)`;
  return `${shadow()}
  <g>
    <path d="M36 58 Q60 46 84 58 L90 150 Q60 162 30 150 Z"
      fill="${C.knightCape}" stroke="${C.ink}" stroke-width="1.05" opacity="0.92"/>
    ${heroicCore(id, {
      torsoFill: metal,
      legFill: metal,
      armFill: metal,
      bootFill: metal,
      gloveFill: metal,
      showSkinHands: false,
      showSkinFace: false,
    })}
    <path d="M50 68 L70 68" stroke="${C.metalLo}" stroke-width="1.8" opacity="0.4"/>
    <ellipse cx="42" cy="58" rx="10" ry="7" fill="${metal}" stroke="${C.ink}" stroke-width="0.95"/>
    <ellipse cx="78" cy="58" rx="10" ry="7" fill="${metal}" stroke="${C.ink}" stroke-width="0.95"/>
    <path d="M48 28 Q60 16 72 28 L74 48 Q60 56 46 48 Z"
      fill="${metal}" stroke="${C.ink}" stroke-width="1.25"/>
    <rect x="52" y="38" width="16" height="4" rx="1" fill="${C.ink}" opacity="0.9"/>
    <ellipse cx="28" cy="100" rx="12" ry="16" fill="${metal}" stroke="${C.ink}" stroke-width="1.1"/>
    <ellipse cx="28" cy="100" rx="5.5" ry="8" fill="${C.crimsonDeep}" opacity="0.55"/>
  </g>`;
}
