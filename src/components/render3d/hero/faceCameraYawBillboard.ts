import type { Group, Vector3 } from "three";
import { Vector3 as V3 } from "three";

const worldAnchor = new V3();
const yawLookTarget = new V3();

/** Upright billboard facing the camera (sprite planes stay screen-aligned). */
export function faceCameraYawBillboard(root: Group, cameraPosition: Vector3): void {
  root.getWorldPosition(worldAnchor);
  yawLookTarget.copy(cameraPosition);
  yawLookTarget.y = worldAnchor.y;
  root.lookAt(yawLookTarget);
  root.rotation.x = 0;
  root.rotation.z = 0;
}
