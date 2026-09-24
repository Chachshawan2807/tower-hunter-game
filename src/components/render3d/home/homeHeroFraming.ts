/** Shared portrait framing — matches `hero-showcase__platform` aspect (413×985). */
export const HOME_HERO_PORTRAIT_ASPECT = 413 / 985;

/** World units; feet on y = 0. */
export const HOME_HERO_PORTRAIT_HEIGHT = 2.35;

export function homeHeroPlaneSize(textureAspect: number): { width: number; height: number } {
  const height = HOME_HERO_PORTRAIT_HEIGHT;
  const aspect = textureAspect > 0 ? textureAspect : HOME_HERO_PORTRAIT_ASPECT;
  return { width: height * aspect, height };
}
