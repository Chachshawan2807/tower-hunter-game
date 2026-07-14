import { C } from "../colors.mjs";
import { eyes, hairCap, shadow } from "../anatomy.mjs";

/** Villager — dress/apron with connected arms & visible feet */
export function villagerBody(id) {
  return `${shadow()}
  <g>
    <path d="M46 62 C34 68 28 86 30 108 C31 116 36 118 40 114 C38 96 40 78 50 68 Z"
      fill="url(#${id}-skin)" stroke="${C.ink}" stroke-width="1.1"/>
    <ellipse cx="34" cy="116" rx="7" ry="7.5" fill="url(#${id}-skin)" stroke="${C.ink}" stroke-width="0.9"/>
    <path d="M42 56 Q60 46 78 56 L86 160 Q60 172 34 160 Z"
      fill="${C.villagerDress}" stroke="${C.ink}" stroke-width="1.25"/>
    <path d="M50 66 L70 66 L72 142 Q60 150 48 142 Z"
      fill="${C.villagerApron}" stroke="${C.ink}" stroke-width="0.85" opacity="0.9"/>
    <path d="M46 164 L56 164 L58 174 L44 174 Z" fill="${C.leather}" stroke="${C.ink}" stroke-width="0.8"/>
    <path d="M64 164 L74 164 L76 174 L62 174 Z" fill="${C.leather}" stroke="${C.ink}" stroke-width="0.8"/>
    <path d="M74 62 C86 68 92 86 90 108 C89 116 84 118 80 114 C82 96 80 78 70 68 Z"
      fill="url(#${id}-skin)" stroke="${C.ink}" stroke-width="1.1"/>
    <ellipse cx="86" cy="116" rx="7" ry="7.5" fill="url(#${id}-skin)" stroke="${C.ink}" stroke-width="0.9"/>
    <rect x="56" y="48" width="8" height="10" rx="2.5" fill="url(#${id}-skin)" stroke="${C.ink}" stroke-width="0.75"/>
    <ellipse cx="60" cy="40" rx="10" ry="11.5" fill="url(#${id}-skin)" stroke="${C.ink}" stroke-width="1.15"/>
    ${hairCap("#4a3828")}
    <circle cx="60" cy="26" r="6" fill="#4a3828" stroke="${C.ink}" stroke-width="0.85"/>
    ${eyes(40)}
  </g>`;
}
