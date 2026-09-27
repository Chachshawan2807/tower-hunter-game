import { useEffect } from "react";

import type { AnimationState } from "../../../engine/art/animationStates";
import { RENDER_3D_ART } from "../../../engine/art/render3d";
import { BattleArenaCameraRig } from "./BattleArenaCameraRig";
import { BattleTurntableProvider } from "./BattleTurntableContext";
import { BattleEnemyHero } from "./BattleEnemyHero";
import { BattlePlayerHero } from "./BattlePlayerHero";
import { preloadBattleEnemyViews } from "./battleEnemyViewPreload";
import { preloadBattleFighterModels } from "./battleModelPreload";
import { preloadBattleHeroViews } from "./battleHeroViewPreload";
import { preloadHomeHeroPortrait } from "../home/homeHeroPortraitPreload";

export type BattleScene3DProps = {
  floor: number;
  playerAnim: AnimationState;
  enemyAnim: AnimationState;
  battleSessionKey?: string | null;
};

export function BattleScene3D({
  floor,
  playerAnim,
  enemyAnim,
  battleSessionKey,
}: BattleScene3DProps) {
  useEffect(() => {
    preloadBattleFighterModels();
    preloadHomeHeroPortrait();
    preloadBattleHeroViews();
    preloadBattleEnemyViews();
  }, []);

  return (
    <BattleTurntableProvider
      key={battleSessionKey ?? "battle-turntable"}
      resetKey={battleSessionKey}
    >
      <color attach="background" args={[RENDER_3D_ART.backgroundHex]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={1.05} />
      <directionalLight position={[-4, 2, -2]} intensity={0.35} />
      <BattleArenaCameraRig />
      <BattlePlayerHero animState={playerAnim} />
      <BattleEnemyHero animState={enemyAnim} />
    </BattleTurntableProvider>
  );
}
