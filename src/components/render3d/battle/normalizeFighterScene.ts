import { Box3, Group, Vector3 } from "three";

import { BATTLE_FIGHTER_TARGET_HEIGHT } from "../../../engine/art/battleFighterModels";

/** Scale model and offset so feet sit on local y=0 (parent rig handles combat motion). */
export function normalizeFighterScene(root: Group, targetHeight = BATTLE_FIGHTER_TARGET_HEIGHT): void {
  const box = new Box3().setFromObject(root);
  const size = box.getSize(new Vector3());
  if (size.y <= 0) return;

  const scale = targetHeight / size.y;
  root.scale.setScalar(scale);

  const scaledBox = new Box3().setFromObject(root);
  root.position.y = -scaledBox.min.y;
}
