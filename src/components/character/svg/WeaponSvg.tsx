import type { ItemRarityVisual } from "../../../engine/art/weaponTypes";
import type { WeaponCategoryId } from "../../../engine/art/weaponTypes";
import { RARITY_VISUAL } from "../../../engine/art/weaponTypes";

interface WeaponSvgProps {
  weapon: WeaponCategoryId;
  rarity: ItemRarityVisual;
}

export function WeaponSvg({ weapon, rarity }: WeaponSvgProps) {
  const fx = RARITY_VISUAL[rarity];
  const g = "url(#char-metal)";
  const edge = "#1a1a1a";

  return (
    <g className="char-weapon" transform="translate(78, 72) rotate(12)">
      {fx.darkAura && (
        <ellipse cx="0" cy="20" rx="18" ry="28" fill="rgba(0,0,0,0.35)" />
      )}
      {weapon === "katana" && (
        <g>
          <path d="M0 0 L0 58" stroke={g} strokeWidth="4" strokeLinecap="round" />
          <path d="M0 0 L0 58" stroke={edge} strokeWidth="1" opacity="0.5" />
          <rect x="-5" y="52" width="10" height="4" rx="1" fill="#2a1810" stroke={edge} />
          <circle cx="0" cy="56" r="3" fill="#1a1a1a" />
        </g>
      )}
      {weapon === "dual_swords" && (
        <g>
          <path d="M-8 0 L-10 50" stroke={g} strokeWidth="3" strokeLinecap="round" />
          <path d="M8 0 L10 50" stroke={g} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {weapon === "staff" && (
        <g>
          <path d="M0 4 L0 56" stroke="#4a3020" strokeWidth="4" />
          <circle cx="0" cy="0" r="6" fill="#6b4088" stroke={edge} />
          <circle cx="0" cy="0" r="3" fill="#daa520" opacity="0.8" />
        </g>
      )}
      {weapon === "greatsword" && (
        <g transform="translate(-6, -4)">
          <path d="M6 0 L6 62" stroke={g} strokeWidth="8" strokeLinecap="round" />
          <path d="M-4 48 L16 48" stroke="#3a3a42" strokeWidth="4" />
          <rect x="2" y="58" width="8" height="6" fill="#2a1810" stroke={edge} />
        </g>
      )}
      {weapon === "greataxe" && (
        <g>
          <path d="M0 8 L0 56" stroke="#3a3a42" strokeWidth="3" />
          <path d="M-16 4 Q0 -8 16 4 L12 20 Q0 14 -12 20 Z" fill={g} stroke={edge} />
        </g>
      )}
      {weapon === "spear" && (
        <g>
          <path d="M0 6 L0 58" stroke="#4a3020" strokeWidth="2.5" />
          <path d="M0 0 L-6 12 L6 12 Z" fill={g} stroke={edge} />
        </g>
      )}
      {weapon === "wand" && (
        <g>
          <path d="M0 8 L0 54" stroke="#2a1818" strokeWidth="3" />
          <circle cx="0" cy="4" r="7" fill="#6b4088" stroke={edge} />
          <circle cx="0" cy="4" r="3" fill="#daa520" />
        </g>
      )}
      {weapon === "bow" && (
        <path
          d="M-14 24 Q0 4 14 24 Q0 44 -14 24"
          stroke="#5a4030"
          strokeWidth="3"
          fill="none"
        />
      )}
      {weapon === "dual_daggers" && (
        <g>
          <path d="M-10 4 L-14 46" stroke={g} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M10 4 L14 46" stroke={g} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
      {fx.goldRunes && (
        <text x="0" y="30" textAnchor="middle" fontSize="8" fill="#c5a059" opacity="0.9">
          卍
        </text>
      )}
      {fx.redGems && <circle cx="0" cy="18" r="3" fill="#b22222" stroke="#8b0000" />}
    </g>
  );
}
