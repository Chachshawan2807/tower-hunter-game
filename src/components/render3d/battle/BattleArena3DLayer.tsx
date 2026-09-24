import type { AnimationState } from "../../../engine/art/animationStates";
import { GameCanvas } from "../GameCanvas";
import { BattleScene3D } from "./BattleScene3D";

export type BattleArena3DLayerProps = {
  floor: number;
  playerAnim: AnimationState;
  enemyAnim: AnimationState;
};

export function BattleArena3DLayer({
  floor,
  playerAnim,
  enemyAnim,
}: BattleArena3DLayerProps) {
  return (
    <div className="battle-arena__canvas3d" aria-hidden>
      <GameCanvas className="battle-arena__canvas3d-inner">
        <BattleScene3D floor={floor} playerAnim={playerAnim} enemyAnim={enemyAnim} />
      </GameCanvas>
    </div>
  );
}
