import type { AnimationState } from "../../../engine/art/animationStates";
import { GameCanvas } from "../GameCanvas";
import { BattleScene3D } from "./BattleScene3D";

export type BattleArena3DLayerProps = {
  floor: number;
  playerAnim: AnimationState;
  enemyAnim: AnimationState;
  battleSessionKey?: string | null;
};

export function BattleArena3DLayer({
  floor,
  playerAnim,
  enemyAnim,
  battleSessionKey,
}: BattleArena3DLayerProps) {
  return (
    <div className="battle-arena__canvas3d" aria-hidden>
      <GameCanvas
        className="battle-arena__canvas3d-inner"
        options={{
          gl: { alpha: false, premultipliedAlpha: false },
          onCreated: ({ gl }) => {
            gl.setClearColor(0x000000, 1);
          },
        }}
      >
        <BattleScene3D
          floor={floor}
          playerAnim={playerAnim}
          enemyAnim={enemyAnim}
          battleSessionKey={battleSessionKey}
        />
      </GameCanvas>
    </div>
  );
}
