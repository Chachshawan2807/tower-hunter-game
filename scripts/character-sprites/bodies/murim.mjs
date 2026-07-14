import { C } from "../colors.mjs";
import { eyes, hairCap, heroicCore, shadow } from "../anatomy.mjs";

/** Murim — dark-robed martial artist, crimson headband, topknot */
export function murimBody(id) {
  return `${shadow()}
  <g>
    ${heroicCore(id, {
      torsoFill: C.murimRobe,
      legFill: C.murimRobe,
      armFill: C.murimRobe,
      bootFill: C.leather,
      showSkinHands: true,
    })}
    <rect x="45" y="90" width="30" height="5" rx="2" fill="${C.murimSash}" stroke="${C.ink}" stroke-width="0.65"/>
    <path d="M50 60 L70 60" stroke="${C.crimsonDeep}" stroke-width="1" opacity="0.55"/>
    ${hairCap(C.murimRobe)}
    <ellipse cx="60" cy="25" rx="4" ry="5.5" fill="${C.murimRobe}" stroke="${C.ink}" stroke-width="0.75"/>
    <rect x="50" y="34" width="20" height="3.5" rx="1" fill="${C.crimsonDeep}" stroke="${C.ink}" stroke-width="0.5"/>
    ${eyes(38)}
    <g transform="translate(84,68) rotate(14)">
      <rect x="-2" y="0" width="4" height="52" rx="1" fill="${C.metal}" stroke="${C.ink}" stroke-width="0.75"/>
      <rect x="-3.5" y="-5" width="7" height="7" rx="1" fill="${C.goldDim}" stroke="${C.ink}" stroke-width="0.65"/>
    </g>
  </g>`;
}
