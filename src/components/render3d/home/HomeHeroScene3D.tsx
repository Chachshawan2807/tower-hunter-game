import { useEffect } from "react";

import { preloadBattleHeroViews } from "../battle/battleHeroViewPreload";
import { InkKnightTurnaroundBillboard } from "../hero/InkKnightTurnaroundBillboard";

export function HomeHeroScene3D() {
  useEffect(() => {
    preloadBattleHeroViews();
  }, []);

  return <InkKnightTurnaroundBillboard presentation="showcase" animState="idle" />;
}
