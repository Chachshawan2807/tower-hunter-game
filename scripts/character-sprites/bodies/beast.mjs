import { C } from "../colors.mjs";
import { eyes, shadow } from "../anatomy.mjs";

/** Beast — tall bipedal brute, connected limbs, club */
export function beastBody(id) {
  const fur = `url(#${id}-fur)`;
  return `${shadow()}
  <g>
    <path d="M46 64 C32 72 26 96 28 122 C29 130 36 132 40 126 C36 104 40 80 52 70 Z"
      fill="${fur}" stroke="${C.ink}" stroke-width="1.15"/>
    <ellipse cx="32" cy="128" rx="8" ry="8" fill="${fur}" stroke="${C.ink}" stroke-width="0.95"/>
    <path d="M52 114 C46 132 44 152 46 168 C47 176 54 178 57 172 C56 152 56 132 60 116 Z"
      fill="${C.leather}" stroke="${C.ink}" stroke-width="1.1"/>
    <path d="M46 170 L58 170 L60 178 L44 178 Z" fill="#2a1810" stroke="${C.ink}" stroke-width="0.85"/>
    <path d="M68 114 C74 132 76 152 74 168 C73 176 66 178 63 172 C64 152 64 132 60 116 Z"
      fill="${C.leather}" stroke="${C.ink}" stroke-width="1.1"/>
    <path d="M62 170 L74 170 L76 178 L60 178 Z" fill="#2a1810" stroke="${C.ink}" stroke-width="0.85"/>
    <ellipse cx="60" cy="96" rx="24" ry="30" fill="${fur}" stroke="${C.ink}" stroke-width="1.35"/>
    <path d="M74 64 C88 72 94 96 92 122 C91 130 84 132 80 126 C84 104 80 80 68 70 Z"
      fill="${fur}" stroke="${C.ink}" stroke-width="1.15"/>
    <ellipse cx="88" cy="128" rx="8" ry="8" fill="${fur}" stroke="${C.ink}" stroke-width="0.95"/>
    <ellipse cx="60" cy="48" rx="16" ry="15" fill="${fur}" stroke="${C.ink}" stroke-width="1.25"/>
    <path d="M46 36 L36 18" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>
    <path d="M74 36 L84 18" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="53" cy="46" rx="3.5" ry="4.5" fill="${C.crimson}"/>
    <ellipse cx="67" cy="46" rx="3.5" ry="4.5" fill="${C.crimson}"/>
    <path d="M52 56 Q60 62 68 56" stroke="${C.ink}" stroke-width="1.5" fill="none"/>
    ${eyes(46, C.ink, 10)}
    <g transform="translate(98,62) rotate(10)">
      <rect x="-5" y="0" width="10" height="56" rx="3" fill="${C.leather}" stroke="${C.ink}" stroke-width="0.95"/>
      <circle cx="0" cy="-7" r="9" fill="${C.metalLo}" stroke="${C.ink}" stroke-width="0.95"/>
    </g>
  </g>`;
}
