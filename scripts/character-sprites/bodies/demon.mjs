import { C } from "../colors.mjs";
import { eyes, shadow } from "../anatomy.mjs";

/** Demon — tall horned warrior, connected body, mace */
export function demonBody(id) {
  const skin = `url(#${id}-demon)`;
  return `${shadow()}
  <g>
    <path d="M46 64 C32 72 26 96 28 122 C29 130 36 132 40 126 C36 104 40 80 52 70 Z"
      fill="${skin}" stroke="${C.crimsonDeep}" stroke-width="1.15"/>
    <ellipse cx="32" cy="128" rx="8" ry="8" fill="${skin}" stroke="${C.ink}" stroke-width="0.95"/>
    <path d="M52 114 C46 132 44 152 46 168 C47 176 54 178 57 172 C56 152 56 132 60 116 Z"
      fill="${skin}" stroke="${C.ink}" stroke-width="1.1"/>
    <path d="M46 170 L58 170 L60 178 L44 178 Z" fill="${C.demonHorn}" stroke="${C.ink}" stroke-width="0.85"/>
    <path d="M68 114 C74 132 76 152 74 168 C73 176 66 178 63 172 C64 152 64 132 60 116 Z"
      fill="${skin}" stroke="${C.ink}" stroke-width="1.1"/>
    <path d="M62 170 L74 170 L76 178 L60 178 Z" fill="${C.demonHorn}" stroke="${C.ink}" stroke-width="0.85"/>
    <path d="M44 56 Q60 46 76 56 L80 112 Q60 122 40 112 Z"
      fill="${skin}" stroke="${C.crimsonDeep}" stroke-width="1.3"/>
    <path d="M74 64 C88 72 94 96 92 122 C91 130 84 132 80 126 C84 104 80 80 68 70 Z"
      fill="${skin}" stroke="${C.crimsonDeep}" stroke-width="1.15"/>
    <ellipse cx="88" cy="128" rx="8" ry="8" fill="${skin}" stroke="${C.ink}" stroke-width="0.95"/>
    <ellipse cx="60" cy="42" rx="14" ry="13" fill="${skin}" stroke="${C.crimsonDeep}" stroke-width="1.2"/>
    <path d="M48 32 Q38 12 48 16" stroke="${C.demonHorn}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M72 32 Q82 12 72 16" stroke="${C.demonHorn}" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${eyes(40, C.gold, 9)}
    <path d="M52 50 Q60 56 68 50" stroke="${C.ink}" stroke-width="1.8" fill="none"/>
    <path d="M46 104 Q60 116 74 104 L70 128 Q60 134 50 128 Z"
      fill="${C.demonHorn}" stroke="${C.ink}" stroke-width="0.95"/>
    <g transform="translate(100,58) rotate(12)">
      <rect x="-5.5" y="0" width="11" height="58" rx="3" fill="${C.leather}" stroke="${C.ink}" stroke-width="0.95"/>
      <circle cx="0" cy="-8" r="10" fill="${C.metalLo}" stroke="${C.ink}" stroke-width="0.95"/>
    </g>
  </g>`;
}
