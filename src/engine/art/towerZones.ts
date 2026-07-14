/**
 * Tower Hunter — Building Bible (100-floor zone themes)
 * @see docs/art-bible/MASTER_ART_BIBLE.md §05
 */

export type TowerZoneId =
  | "forgotten-dungeon"
  | "murim-pagoda"
  | "knight-citadel"
  | "void-pinnacle";

export interface TowerZone {
  id: TowerZoneId;
  /** Inclusive floor range */
  floorMin: number;
  floorMax: number;
  nameKey: string;
  /** CSS class suffix for environment styling */
  cssClass: string;
  /** Primary hybrid theme emphasis */
  theme: "murim" | "knight" | "fantasy" | "mixed";
}

export const TOWER_ZONES: readonly TowerZone[] = [
  {
    id: "forgotten-dungeon",
    floorMin: 1,
    floorMax: 30,
    nameKey: "tower.zone.forgotten",
    cssClass: "env-zone--forgotten-dungeon",
    theme: "mixed",
  },
  {
    id: "murim-pagoda",
    floorMin: 31,
    floorMax: 60,
    nameKey: "tower.zone.murim",
    cssClass: "env-zone--murim-pagoda",
    theme: "murim",
  },
  {
    id: "knight-citadel",
    floorMin: 61,
    floorMax: 90,
    nameKey: "tower.zone.knight",
    cssClass: "env-zone--knight-citadel",
    theme: "knight",
  },
  {
    id: "void-pinnacle",
    floorMin: 91,
    floorMax: 100,
    nameKey: "tower.zone.void",
    cssClass: "env-zone--void-pinnacle",
    theme: "fantasy",
  },
] as const;

const TOTAL_FLOORS = 100;

export function clampFloor(floor: number): number {
  return Math.max(1, Math.min(TOTAL_FLOORS, Math.floor(floor)));
}

export function getTowerZone(floor: number): TowerZone {
  const f = clampFloor(floor);
  const zone = TOWER_ZONES.find((z) => f >= z.floorMin && f <= z.floorMax);
  return zone ?? TOWER_ZONES[0];
}

export function getTowerZoneProgress(floor: number): number {
  const zone = getTowerZone(floor);
  const span = zone.floorMax - zone.floorMin;
  if (span <= 0) return 1;
  return (clampFloor(floor) - zone.floorMin) / span;
}

export function zoneBackgroundUrl(zoneId: TowerZoneId): string {
  return `/assets/zones/${zoneId}.svg`;
}
