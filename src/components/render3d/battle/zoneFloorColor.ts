import { RENDER_3D_ART } from "../../../engine/art/render3d";
import { getTowerZone } from "../../../engine/art/towerZones";

export function floorColorForBattle(floor: number): string {
  const zone = getTowerZone(floor);
  switch (zone.id) {
    case "forgotten-dungeon":
      return RENDER_3D_ART.floorHex;
    case "imperial-bastion":
      return "#252a33";
    case "knight-citadel":
      return "#1e2430";
    case "void-pinnacle":
      return "#120818";
    default:
      return RENDER_3D_ART.floorHex;
  }
}
