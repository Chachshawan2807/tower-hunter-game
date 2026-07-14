import { memo } from "react";
import type { WeaponCategoryId } from "../../engine/art/weaponTypes";
import type { ItemRarityVisual } from "../../engine/art/weaponTypes";
import { RARITY_VISUAL } from "../../engine/art/weaponTypes";

interface WeaponIconProps {
  weaponId: WeaponCategoryId;
  rarity?: ItemRarityVisual;
  size?: number;
  className?: string;
}

function WeaponPaths({ weaponId }: { weaponId: WeaponCategoryId }) {
  switch (weaponId) {
    case "katana":
      return (
        <>
          <path d="M24 4 L24 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M20 52 L28 52 L24 58 Z" fill="currentColor" />
        </>
      );
    case "dual_swords":
      return (
        <>
          <path d="M16 8 L14 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 8 L34 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    case "staff":
      return (
        <>
          <path d="M24 6 L24 54" stroke="currentColor" strokeWidth="3" />
          <circle cx="24" cy="8" r="5" fill="currentColor" opacity="0.85" />
        </>
      );
    case "greatsword":
      return (
        <>
          <path d="M24 2 L24 48" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M14 40 L34 40" stroke="currentColor" strokeWidth="3" />
        </>
      );
    case "greataxe":
      return (
        <>
          <path d="M24 10 L24 54" stroke="currentColor" strokeWidth="3" />
          <path d="M8 14 Q24 6 40 14 L36 28 Q24 22 12 28 Z" fill="currentColor" />
        </>
      );
    case "spear":
      return (
        <>
          <path d="M24 6 L24 54" stroke="currentColor" strokeWidth="2.5" />
          <path d="M24 2 L18 12 L30 12 Z" fill="currentColor" />
        </>
      );
    case "wand":
      return (
        <>
          <path d="M24 14 L24 54" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="24" cy="10" r="6" fill="currentColor" />
          <circle cx="24" cy="10" r="3" fill="#6b4088" />
        </>
      );
    case "bow":
      return (
        <path
          d="M10 28 Q24 8 38 28 Q24 48 10 28"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
      );
    case "dual_daggers":
      return (
        <>
          <path d="M14 12 L10 48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M34 12 L38 48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      );
    default:
      return null;
  }
}

export const WeaponIcon = memo(function WeaponIcon({
  weaponId,
  rarity = "common",
  size = 48,
  className = "",
}: WeaponIconProps) {
  const visual = RARITY_VISUAL[rarity];
  const classes = [
    "weapon-icon",
    visual.goldRunes ? "weapon-icon--gold-runes" : "",
    visual.redGems ? "weapon-icon--red-gems" : "",
    visual.darkAura ? "weapon-icon--dark-aura" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={classes}
      width={size}
      height={size}
      viewBox="0 0 48 56"
      aria-hidden="true"
      role="img"
    >
      <WeaponPaths weaponId={weaponId} />
      {visual.goldRunes && (
        <text x="24" y="54" textAnchor="middle" className="weapon-icon__rune" fontSize="6">
          卍
        </text>
      )}
      {visual.redGems && (
        <circle cx="24" cy="20" r="3" className="weapon-icon__gem" />
      )}
    </svg>
  );
});
