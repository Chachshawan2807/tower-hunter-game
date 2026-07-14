import type { CharacterEquipmentVisual } from "../../../engine/art/equipment/catalog";
import type { ItemRarityVisual } from "../../../engine/art/weaponTypes";
import { rarityGlowFilter } from "./shared";

export function CloakLayer({
  path,
  cloakId,
  rarity,
}: {
  path: CharacterEquipmentVisual["path"];
  cloakId: string;
  rarity?: ItemRarityVisual;
}) {
  const glow = rarityGlowFilter(rarity);

  if (path === "murim") {
    return (
      <g style={{ filter: glow }}>
        <path
          d="M32 88 Q60 82 88 88 L90 118 Q60 124 30 118 Z"
          fill="#1a1410"
          stroke="#0d0d0d"
          strokeWidth="1"
          opacity="0.9"
        />
        {cloakId.includes("sash") && (
          <rect x="40" y="104" width="40" height="8" rx="2" fill="#8b0000" stroke="#b8860b" strokeWidth="0.6" />
        )}
      </g>
    );
  }

  if (path === "knight") {
    return (
      <g style={{ filter: glow }}>
        <path
          d="M28 76 Q60 66 92 76 L96 142 Q60 152 24 142 Z"
          fill="#4a1010"
          stroke="#0d0d0d"
          strokeWidth="1"
          opacity="0.92"
        />
        {cloakId.includes("cape") && (
          <path d="M34 90 Q60 86 86 90" stroke="#8b0000" strokeWidth="1.2" fill="none" opacity="0.55" />
        )}
      </g>
    );
  }

  return (
    <g style={{ filter: glow }}>
      <path
        d="M26 80 Q60 72 94 80 L98 132 Q60 140 22 132 Z"
        fill="#1a1018"
        stroke="#0d0d0d"
        strokeWidth="1"
        opacity="0.88"
      />
      {cloakId.includes("bone") && (
        <>
          <circle cx="60" cy="108" r="5" fill="#c8c0b0" stroke="#0d0d0d" strokeWidth="0.8" />
          <path d="M58 113 L62 118 M62 113 L58 118" stroke="#8b6914" strokeWidth="0.8" />
        </>
      )}
    </g>
  );
}

export function BootsLayer({
  path,
  bootsId,
  rarity,
}: {
  path: CharacterEquipmentVisual["path"];
  bootsId: string;
  rarity?: ItemRarityVisual;
}) {
  const glow = rarityGlowFilter(rarity);

  if (path === "murim") {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="51" cy="128" rx="10" ry="14" fill="#2a2018" stroke="#0d0d0d" strokeWidth="1" />
        <ellipse cx="69" cy="128" rx="10" ry="14" fill="#2a2018" stroke="#0d0d0d" strokeWidth="1" />
        {bootsId.includes("sandals") && (
          <>
            <path d="M44 134 L58 134" stroke="#b8860b" strokeWidth="1.2" />
            <path d="M62 134 L76 134" stroke="#b8860b" strokeWidth="1.2" />
          </>
        )}
      </g>
    );
  }

  if (path === "knight") {
    return (
      <g style={{ filter: glow }}>
        <ellipse cx="51" cy="130" rx="10" ry="15" fill="url(#equip-metal)" stroke="#0d0d0d" strokeWidth="1" />
        <ellipse cx="69" cy="130" rx="10" ry="15" fill="url(#equip-metal)" stroke="#0d0d0d" strokeWidth="1" />
        {bootsId.includes("greaves") && (
          <path d="M46 122 L54 122 M66 122 L74 122" stroke="#5a5a64" strokeWidth="2" />
        )}
      </g>
    );
  }

  return (
    <g style={{ filter: glow }}>
      <ellipse cx="51" cy="128" rx="10" ry="14" fill="#1a1018" stroke="#0d0d0d" strokeWidth="1" />
      <ellipse cx="69" cy="128" rx="10" ry="14" fill="#1a1018" stroke="#0d0d0d" strokeWidth="1" />
      {bootsId.includes("treads") && (
        <ellipse cx="51" cy="136" rx="8" ry="3" fill="#0d0d0d" opacity="0.35" />
      )}
    </g>
  );
}

export function GlovesLayer({
  path,
  glovesId,
  rarity,
}: {
  path: CharacterEquipmentVisual["path"];
  glovesId: string;
  rarity?: ItemRarityVisual;
}) {
  const glow = rarityGlowFilter(rarity);

  if (path === "murim") {
    return (
      <g style={{ filter: glow }}>
        <circle cx="36" cy="90" r="8" fill="#c49a6c" stroke="#0d0d0d" strokeWidth="0.8" />
        <circle cx="84" cy="90" r="8" fill="#c49a6c" stroke="#0d0d0d" strokeWidth="0.8" />
        {glovesId.includes("wraps") && (
          <>
            <path d="M30 86 L42 86 M30 92 L42 92" stroke="#8b6914" strokeWidth="1.4" />
            <path d="M78 86 L90 86 M78 92 L90 92" stroke="#8b6914" strokeWidth="1.4" />
          </>
        )}
      </g>
    );
  }

  if (path === "knight") {
    return (
      <g style={{ filter: glow }}>
        <circle cx="36" cy="90" r="8" fill="url(#equip-metal)" stroke="#0d0d0d" strokeWidth="0.8" />
        <circle cx="84" cy="90" r="8" fill="url(#equip-metal)" stroke="#0d0d0d" strokeWidth="0.8" />
        {glovesId.includes("gauntlets") && (
          <>
            <rect x="30" y="84" width="12" height="14" rx="3" fill="url(#equip-metal)" stroke="#0d0d0d" strokeWidth="0.8" />
            <rect x="78" y="84" width="12" height="14" rx="3" fill="url(#equip-metal)" stroke="#0d0d0d" strokeWidth="0.8" />
          </>
        )}
      </g>
    );
  }

  return (
    <g style={{ filter: glow }}>
      <circle cx="36" cy="90" r="8" fill="#c49a6c" stroke="#0d0d0d" strokeWidth="0.8" />
      <circle cx="84" cy="90" r="8" fill="#c49a6c" stroke="#0d0d0d" strokeWidth="0.8" />
      {glovesId.includes("bracers") && (
        <>
          <rect x="29" y="84" width="14" height="10" rx="2" fill="#c8c0b0" stroke="#0d0d0d" strokeWidth="0.8" />
          <rect x="77" y="84" width="14" height="10" rx="2" fill="#c8c0b0" stroke="#0d0d0d" strokeWidth="0.8" />
        </>
      )}
    </g>
  );
}
