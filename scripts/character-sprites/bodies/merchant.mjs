import { C } from "../colors.mjs";
import { eyes, hairCap, heroicCore, shadow } from "../anatomy.mjs";

/** Merchant — tunic, wide hat, coin sack */
export function merchantBody(id) {
  return `${shadow()}
  <g>
    ${heroicCore(id, {
      torsoFill: C.merchantTunic,
      legFill: C.leather,
      armFill: C.merchantTunic,
      bootFill: C.leather,
      showSkinHands: true,
    })}
    <path d="M50 84 L70 84" stroke="${C.goldDim}" stroke-width="1.3" opacity="0.7"/>
    ${hairCap(C.merchantHat)}
    <ellipse cx="60" cy="28" rx="20" ry="5" fill="${C.merchantHat}" stroke="${C.ink}" stroke-width="0.95"/>
    <path d="M50 28 Q60 14 70 28" fill="${C.merchantHat}" stroke="${C.ink}" stroke-width="0.95"/>
    ${eyes(40)}
    <path d="M54 48 Q60 52 66 48" stroke="${C.ink}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="92" cy="108" rx="12" ry="16" fill="${C.leather}" stroke="${C.ink}" stroke-width="1"/>
    <path d="M86 94 Q92 86 98 94" stroke="${C.gold}" stroke-width="1.4" fill="none"/>
  </g>`;
}
