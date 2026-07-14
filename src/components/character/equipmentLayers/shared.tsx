import type { ItemRarityVisual } from "../../../engine/art/weaponTypes";

export function rarityGlowFilter(rarity: ItemRarityVisual | undefined): string | undefined {
  if (!rarity || rarity === "common") return undefined;
  const colors: Record<Exclude<ItemRarityVisual, "common">, string> = {
    rare: "rgba(197, 160, 89, 0.7)",
    epic: "rgba(155, 93, 229, 0.75)",
    legendary: "rgba(178, 34, 34, 0.8)",
  };
  return `drop-shadow(0 0 4px ${colors[rarity]})`;
}

export const EQUIP_GRADIENTS = (
  <defs>
    <linearGradient id="equip-metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#8a8a96" />
      <stop offset="50%" stopColor="#5a5a64" />
      <stop offset="100%" stopColor="#3a3a44" />
    </linearGradient>
    <linearGradient id="char-metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#8a8a96" />
      <stop offset="50%" stopColor="#5a5a64" />
      <stop offset="100%" stopColor="#3a3a44" />
    </linearGradient>
  </defs>
);
