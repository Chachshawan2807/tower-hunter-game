import { C } from "../colors.mjs";
import { eyes, heroicCore, shadow } from "../anatomy.mjs";

/** Fantasy — hooded mystic with staff */
export function fantasyBody(id) {
  return `${shadow()}
  <g>
    ${heroicCore(id, {
      torsoFill: C.fantasyHood,
      legFill: C.fantasyHood,
      armFill: C.fantasyHood,
      bootFill: C.leather,
      showSkinHands: true,
      showSkinFace: false,
    })}
    <path d="M48 64 L72 64" stroke="${C.fantasyAccent}" stroke-width="1.1" opacity="0.55"/>
    <path d="M46 34 Q60 16 74 34 L76 52 Q60 60 44 52 Z"
      fill="${C.fantasyHood}" stroke="${C.ink}" stroke-width="1.2"/>
    <ellipse cx="60" cy="42" rx="9" ry="10" fill="url(#${id}-skin)"/>
    ${eyes(42)}
    <line x1="94" y1="34" x2="94" y2="172" stroke="${C.leather}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="94" cy="30" r="7" fill="${C.fantasyAccent}" stroke="${C.gold}" stroke-width="1"/>
    <circle cx="94" cy="30" r="3" fill="${C.gold}" opacity="0.75"/>
  </g>`;
}
