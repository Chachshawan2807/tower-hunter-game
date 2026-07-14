import { ISO_COLORS as C } from "../../../../engine/art/characters/isoColors";
import { IsoDefs, IsoEyes, IsoHands, IsoHead, IsoLegs, IsoShadow, IsoTorso } from "./IsoPrimitives";

/** Merchant NPC (ref: hat + shoulder sack) */
export function IsoMerchantNpc() {
  return (
    <g filter="url(#iso-soft)">
      <IsoDefs />
      <IsoShadow />
      <IsoLegs fill="#2a2018" top={108} />
      <IsoTorso fill={C.merchantTunic} top={74} />
      <IsoHands />
      <IsoHead cy={52} />
      {/* Wide hat */}
      <ellipse cx="60" cy="38" rx="22" ry="6" fill={C.merchantHat} stroke={C.ink} strokeWidth="1" />
      <path d="M48 38 Q60 22 72 38" fill={C.merchantHat} stroke={C.ink} strokeWidth="1" />
      {/* Mustache */}
      <path d="M54 60 Q60 64 66 60" stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      <IsoEyes cy={52} />
      {/* Sack on back */}
      <ellipse cx="88" cy="88" rx="14" ry="18" fill="#4a3828" stroke={C.ink} strokeWidth="1" />
      <path d="M82 72 Q88 68 94 72" stroke="#6a5038" strokeWidth="2" fill="none" />
    </g>
  );
}

/** Villager NPC (ref: dress + apron + bun) */
export function IsoVillagerNpc() {
  return (
    <g filter="url(#iso-soft)">
      <IsoDefs />
      <IsoShadow />
      {/* Dress */}
      <path
        d="M36 78 Q60 70 84 78 L88 132 Q60 142 32 132 Z"
        fill={C.villagerDress}
        stroke={C.ink}
        strokeWidth="1.2"
      />
      {/* Apron */}
      <path
        d="M46 82 L74 82 L72 120 Q60 126 48 120 Z"
        fill={C.villagerApron}
        stroke={C.ink}
        strokeWidth="0.8"
        opacity="0.85"
      />
      <IsoHead cy={50} rx={18} ry={19} />
      {/* Hair bun */}
      <circle cx="60" cy="30" r="8" fill="#4a3828" stroke={C.ink} strokeWidth="1" />
      <IsoEyes cy={52} />
    </g>
  );
}
