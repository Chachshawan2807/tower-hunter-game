import type { CharacterEquipmentVisual } from "../../../engine/art/equipment/catalog";
import type { ItemRarityVisual } from "../../../engine/art/weaponTypes";
import { rarityGlowFilter } from "./shared";

export function HelmLayer({
  path,
  helmId,
  rarity,
}: {
  path: CharacterEquipmentVisual["path"];
  helmId: string;
  rarity?: ItemRarityVisual;
}) {
  const glow = rarityGlowFilter(rarity);

  if (path === "murim") {
    const goldTrim = helmId.includes("headband");
    return (
      <g style={{ filter: glow }}>
        <rect x="40" y="46" width="40" height="5" rx="2" fill="#8b0000" stroke="#0d0d0d" strokeWidth="0.8" />
        {goldTrim && <rect x="38" y="44" width="44" height="2" rx="1" fill="#c5a059" opacity="0.85" />}
        <ellipse cx="60" cy="34" rx="6" ry="8" fill="#1a1410" stroke="#0d0d0d" strokeWidth="1" />
      </g>
    );
  }

  if (path === "knight") {
    return (
      <g style={{ filter: glow }}>
        <path
          d="M38 44 Q60 28 82 44 L80 62 Q60 70 40 62 Z"
          fill="url(#equip-metal)"
          stroke="#0d0d0d"
          strokeWidth="1.5"
        />
        <rect x="46" y="52" width="28" height="5" rx="1" fill="#0d0d0d" opacity="0.85" />
      </g>
    );
  }

  return (
    <g style={{ filter: glow }}>
      <path
        d="M36 48 Q60 30 84 48 L86 68 Q60 78 34 68 Z"
        fill="#2a2038"
        stroke="#0d0d0d"
        strokeWidth="1.5"
      />
      <path d="M48 50 Q60 42 72 50" stroke="#6b4088" strokeWidth="1.2" fill="none" opacity="0.6" />
    </g>
  );
}

export function ChestLayer({
  path,
  chestId,
  rarity,
}: {
  path: CharacterEquipmentVisual["path"];
  chestId: string;
  rarity?: ItemRarityVisual;
}) {
  const glow = rarityGlowFilter(rarity);

  if (path === "murim") {
    return (
      <g style={{ filter: glow }}>
        <rect x="44" y="74" width="32" height="38" rx="11" fill="#1a1410" stroke="#0d0d0d" strokeWidth="1.2" />
        <rect x="42" y="106" width="36" height="6" rx="2" fill="#b8860b" stroke="#0d0d0d" strokeWidth="0.8" />
        {chestId.includes("robe") && (
          <path d="M46 78 L74 78" stroke="#8b0000" strokeWidth="1" opacity="0.45" />
        )}
      </g>
    );
  }

  if (path === "knight") {
    return (
      <g style={{ filter: glow }}>
        <path
          d="M36 72 Q60 64 84 72 L88 118 Q60 126 32 118 Z"
          fill="url(#equip-metal)"
          stroke="#0d0d0d"
          strokeWidth="1.5"
        />
        <ellipse cx="34" cy="78" rx="10" ry="8" fill="url(#equip-metal)" stroke="#0d0d0d" strokeWidth="1" />
        <ellipse cx="86" cy="78" rx="10" ry="8" fill="url(#equip-metal)" stroke="#0d0d0d" strokeWidth="1" />
      </g>
    );
  }

  return (
    <g style={{ filter: glow }}>
      <path
        d="M34 74 Q60 66 86 74 L90 120 Q60 128 30 120 Z"
        fill="#2a2038"
        stroke="#0d0d0d"
        strokeWidth="1.2"
      />
      <path d="M48 82 L72 82" stroke="#6b4088" strokeWidth="1" opacity="0.5" />
      {chestId.includes("leathers") && (
        <path d="M38 88 Q60 92 82 88" stroke="#8b6914" strokeWidth="1.2" fill="none" opacity="0.5" />
      )}
    </g>
  );
}
