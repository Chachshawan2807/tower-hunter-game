import { ISO_COLORS as C } from "../../../../engine/art/characters/isoColors";
import { IsoDefs, IsoEyes, IsoShadow } from "./IsoPrimitives";

/** Beast — tower guardian creature (ref: dungeon beast) */
export function IsoBeastEnemy() {
  return (
    <g filter="url(#iso-soft)">
      <IsoDefs />
      <IsoShadow cx={60} cy={180} />
      {/* Hunched body */}
      <ellipse cx="60" cy="100" rx="30" ry="36" fill={C.beastFur} stroke={C.ink} strokeWidth="1.5" />
      {/* Snout head */}
      <ellipse cx="60" cy="58" rx="24" ry="22" fill={C.beastFur} stroke={C.ink} strokeWidth="1.5" />
      <ellipse cx="52" cy="56" rx="4" ry="5" fill={C.crimson} />
      <ellipse cx="68" cy="56" rx="4" ry="5" fill={C.crimson} />
      <path d="M54 66 Q60 72 66 66" stroke={C.ink} strokeWidth="1.5" fill="none" />
      {/* Horns */}
      <path d="M40 44 L32 24" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M80 44 L88 24" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />
      {/* Stubby legs */}
      <ellipse cx="44" cy="132" rx="10" ry="12" fill="#2a1810" stroke={C.ink} strokeWidth="1" />
      <ellipse cx="76" cy="132" rx="10" ry="12" fill="#2a1810" stroke={C.ink} strokeWidth="1" />
      {/* Club arm */}
      <circle cx="88" cy="88" r="8" fill={C.beastFur} stroke={C.ink} strokeWidth="1" />
      <g transform="translate(92, 72) rotate(15)">
        <rect x="-4" y="0" width="8" height="36" rx="3" fill="#4a4038" stroke={C.ink} strokeWidth="1" />
        <circle cx="0" cy="-6" r="8" fill={C.metalLo} stroke={C.ink} strokeWidth="1" />
        <circle cx="-4" cy="-8" r="2" fill={C.metalHi} />
        <circle cx="4" cy="-4" r="2" fill={C.metalHi} />
      </g>
    </g>
  );
}

/** Demon — boss ogre (ref: red demon with horns + morningstar) */
export function IsoDemonEnemy() {
  return (
    <g filter="url(#iso-soft)" transform="translate(0, -6) scale(1.06)">
      <IsoDefs />
      <IsoShadow cx={60} cy={182} />
      {/* Bulk body */}
      <ellipse cx="60" cy="104" rx="34" ry="38" fill="url(#iso-demon)" stroke={C.crimsonDeep} strokeWidth="1.5" />
      {/* Large head */}
      <ellipse cx="60" cy="52" rx="26" ry="24" fill="url(#iso-demon)" stroke={C.crimsonDeep} strokeWidth="1.5" />
      <IsoEyes cy={50} spacing={12} color={C.gold} />
      <path d="M52 62 Q60 68 68 62" stroke={C.ink} strokeWidth="2" fill="none" />
      {/* Curved horns */}
      <path d="M38 40 Q30 18 42 22" stroke={C.demonHorn} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M82 40 Q90 18 78 22" stroke={C.demonHorn} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Loincloth */}
      <path d="M38 118 Q60 128 82 118 L78 140 Q60 146 42 140 Z" fill="#2a1810" stroke={C.ink} strokeWidth="1" />
      {/* Legs */}
      <ellipse cx="46" cy="138" rx="11" ry="14" fill="url(#iso-demon)" stroke={C.ink} strokeWidth="1" />
      <ellipse cx="74" cy="138" rx="11" ry="14" fill="url(#iso-demon)" stroke={C.ink} strokeWidth="1" />
      {/* Morningstar club */}
      <circle cx="90" cy="90" r="9" fill="url(#iso-demon)" stroke={C.ink} strokeWidth="1" />
      <g transform="translate(94, 68) rotate(20)">
        <rect x="-5" y="0" width="10" height="42" rx="4" fill="#3a3028" stroke={C.ink} strokeWidth="1" />
        <circle cx="0" cy="-8" r="10" fill={C.metalLo} stroke={C.ink} strokeWidth="1.2" />
        <circle cx="-5" cy="-12" r="2.5" fill={C.metalHi} />
        <circle cx="5" cy="-10" r="2.5" fill={C.metalHi} />
        <circle cx="0" cy="-14" r="2" fill={C.metalHi} />
      </g>
    </g>
  );
}
