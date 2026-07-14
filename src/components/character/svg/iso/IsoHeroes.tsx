import type { CharacterEquipmentVisual } from "../../../../engine/art/equipment/catalog";
import { ISO_COLORS as C } from "../../../../engine/art/characters/isoColors";
import { WeaponSvg } from "../WeaponSvg";
import { IsoDefs, IsoEyes, IsoHands, IsoHead, IsoLegs, IsoShadow, IsoTorso } from "./IsoPrimitives";

interface HeroProps {
  equipment?: CharacterEquipmentVisual;
}

/** Murim — dark-robed martial artist with crimson headband (ref: warrior) */
export function IsoMurimHero({ equipment }: HeroProps) {
  return (
    <g filter="url(#iso-soft)">
      <IsoDefs />
      <IsoShadow />
      <IsoLegs fill={C.murimRobe} />
      <IsoTorso fill={C.murimRobe} />
      {/* Sash belt */}
      <rect x="42" y="100" width="36" height="6" rx="2" fill={C.murimSash} stroke={C.ink} strokeWidth="0.8" />
      <IsoHands />
      <IsoHead />
      {/* Topknot */}
      <ellipse cx="60" cy="34" rx="6" ry="8" fill={C.murimRobe} stroke={C.ink} strokeWidth="1" />
      {/* Crimson headband */}
      <rect x="40" y="46" width="40" height="5" rx="2" fill={C.crimsonDeep} />
      <IsoEyes cy={54} />
      {equipment && <WeaponSvg weapon={equipment.weapon} rarity={equipment.weaponRarity} />}
    </g>
  );
}

/** Knight — full plate + bucket helm + shield (ref: heavy knight) */
export function IsoKnightHero({ equipment }: HeroProps) {
  return (
    <g filter="url(#iso-soft)">
      <IsoDefs />
      <IsoShadow />
      {/* Cape */}
      <path
        d="M30 78 Q60 68 90 78 L94 138 Q60 148 26 138 Z"
        fill={C.knightCape}
        stroke={C.ink}
        strokeWidth="1"
        opacity="0.9"
      />
      {/* Greaves */}
      <ellipse cx="51" cy="128" rx="9" ry="14" fill="url(#iso-metal)" stroke={C.ink} strokeWidth="1" />
      <ellipse cx="69" cy="128" rx="9" ry="14" fill="url(#iso-metal)" stroke={C.ink} strokeWidth="1" />
      {/* Cuirass */}
      <path
        d="M36 72 Q60 64 84 72 L88 118 Q60 126 32 118 Z"
        fill="url(#iso-metal)"
        stroke={C.ink}
        strokeWidth="1.5"
      />
      {/* Pauldrons */}
      <ellipse cx="34" cy="78" rx="10" ry="8" fill="url(#iso-metal)" stroke={C.ink} strokeWidth="1" />
      <ellipse cx="86" cy="78" rx="10" ry="8" fill="url(#iso-metal)" stroke={C.ink} strokeWidth="1" />
      {/* Gauntlets */}
      <IsoHands skin={false} />
      {/* Bucket helm */}
      <path
        d="M38 44 Q60 28 82 44 L80 62 Q60 70 40 62 Z"
        fill="url(#iso-metal)"
        stroke={C.ink}
        strokeWidth="1.5"
      />
      <rect x="46" y="52" width="28" height="5" rx="1" fill={C.ink} opacity="0.85" />
      {/* Round shield */}
      <ellipse cx="28" cy="96" rx="12" ry="16" fill="url(#iso-metal)" stroke={C.ink} strokeWidth="1.2" />
      <ellipse cx="28" cy="96" rx="6" ry="8" fill={C.crimsonDeep} opacity="0.5" />
      {equipment && <WeaponSvg weapon={equipment.weapon} rarity={equipment.weaponRarity} />}
    </g>
  );
}

/** Fantasy — hooded mystic with staff (ref: wizard/rogue) */
export function IsoFantasyHero({ equipment }: HeroProps) {
  return (
    <g filter="url(#iso-soft)">
      <IsoDefs />
      <IsoShadow />
      <IsoLegs fill={C.fantasyHood} />
      {/* Robe */}
      <path
        d="M34 74 Q60 66 86 74 L90 120 Q60 128 30 120 Z"
        fill={C.fantasyHood}
        stroke={C.ink}
        strokeWidth="1.2"
      />
      <path d="M48 82 L72 82" stroke={C.fantasyAccent} strokeWidth="1" opacity="0.5" />
      <IsoHands />
      {/* Hood */}
      <path
        d="M36 48 Q60 30 84 48 L86 68 Q60 78 34 68 Z"
        fill={C.fantasyHood}
        stroke={C.ink}
        strokeWidth="1.5"
      />
      <IsoHead rx={16} ry={17} cy={56} />
      <IsoEyes cy={56} />
      {/* Staff orb */}
      {!equipment && (
        <g transform="translate(88, 60)">
          <line x1="0" y1="0" x2="0" y2="48" stroke="#3a2820" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="-4" r="7" fill={C.fantasyAccent} stroke={C.goldDim} strokeWidth="1" />
          <circle cx="0" cy="-4" r="3" fill={C.gold} opacity="0.7" />
        </g>
      )}
      {equipment && <WeaponSvg weapon={equipment.weapon} rarity={equipment.weaponRarity} />}
    </g>
  );
}
