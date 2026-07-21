import type { TowerZoneId } from "../../engine/art/towerZones";
import { getTowerZone } from "../../engine/art/towerZones";
import type { ComponentProps, ComponentType } from "react";
import { BattleArena } from "../battle/BattleArena";
import { ForgottenDungeonArena } from "./forgotten-dungeon";
import { ImperialBastionArena } from "./imperial-bastion";
import { KnightCitadelArena } from "./knight-citadel";
import { VoidPinnacleArena } from "./void-pinnacle";
import type { ZoneArenaProps } from "./createZoneArena";

type BattleArenaProps = ComponentProps<typeof BattleArena>;

interface ZoneBattleArenaProps extends BattleArenaProps {
  floor: number;
}

const ZONE_ARENAS: Record<TowerZoneId, ComponentType<ZoneArenaProps>> = {
  "forgotten-dungeon": ForgottenDungeonArena,
  "imperial-bastion": ImperialBastionArena,
  "knight-citadel": KnightCitadelArena,
  "void-pinnacle": VoidPinnacleArena,
};

/** Routes battle presentation to the correct tower zone shell. */
export function ZoneBattleArena({ floor, ...arenaProps }: ZoneBattleArenaProps) {
  const zone = getTowerZone(floor);
  const Arena = ZONE_ARENAS[zone.id];

  return <Arena floor={floor} {...arenaProps} />;
}

export { ZoneArenaShell } from "./ZoneArenaShell";
export type { ZoneArenaProps } from "./createZoneArena";
