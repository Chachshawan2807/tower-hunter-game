import type { ReactNode } from "react";
import { getTowerZone } from "../../engine/art/towerZones";

interface ZoneArenaShellProps {
  floor: number;
  children: ReactNode;
}

/** Shared zone wrapper — applies tower zone CSS from Art Bible tokens. */
export function ZoneArenaShell({ floor, children }: ZoneArenaShellProps) {
  const zone = getTowerZone(floor);

  return (
    <div className={`zone-arena ${zone.cssClass}`} data-zone={zone.id}>
      {children}
    </div>
  );
}
