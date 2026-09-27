import type { Object3D } from "three";
import { Vector3 } from "three";

import {
  opponentLookTarget,
  type BattleFighterSide,
} from "../../../engine/art/battleArenaLayout";

const target = new Vector3();

/** Yaw-only look-at so fighters stay upright while facing each other. */
export function applyFaceOpponent(root: Object3D, side: BattleFighterSide): void {
  const point = opponentLookTarget(side);
  target.set(point.x, point.y, point.z);
  root.lookAt(target);
  root.rotation.x = 0;
  root.rotation.z = 0;
}
