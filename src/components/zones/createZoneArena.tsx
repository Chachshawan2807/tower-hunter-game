import type { ComponentProps, ComponentType } from "react";
import { BattleArena } from "../battle/BattleArena";
import { ZoneArenaShell } from "./ZoneArenaShell";

type BattleArenaProps = ComponentProps<typeof BattleArena>;

export interface ZoneArenaProps extends BattleArenaProps {
  floor: number;
}

export function createZoneArena(
  displayName: string
): ComponentType<ZoneArenaProps> {
  function ZoneArena({ floor, ...arenaProps }: ZoneArenaProps) {
    return (
      <ZoneArenaShell floor={floor}>
        <BattleArena {...arenaProps} />
      </ZoneArenaShell>
    );
  }

  ZoneArena.displayName = displayName;
  return ZoneArena;
}
