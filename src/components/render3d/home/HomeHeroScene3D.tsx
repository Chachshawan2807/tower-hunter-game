import { useEffect } from "react";

import { HomeHeroBillboard } from "./HomeHeroBillboard";
import { preloadHomeHeroPortrait } from "./homeHeroPortraitPreload";

export function HomeHeroScene3D() {
  useEffect(() => {
    preloadHomeHeroPortrait();
  }, []);

  return <HomeHeroBillboard />;
}
