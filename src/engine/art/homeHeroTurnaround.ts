/**
 * Home hero pseudo-3D — multi-angle turnaround frames (yaw → nearest view).
 * Assets: `public/assets/characters/hero-turnaround/` via `npm run split:hero-turnaround`
 */

const BASE = "/assets/characters/hero-turnaround";

export const HOME_HERO_TURNAROUND_TEXTURE_URLS = [
  `${BASE}/turn-00-three-quarter.png`,
  `${BASE}/turn-01-front.png`,
  `${BASE}/turn-02-back.png`,
  `${BASE}/turn-03-right.png`,
  `${BASE}/turn-04-left.png`,
] as const;

/** Yaw (rad) for each texture index — drag right reveals character's right side. */
const FRAME_YAWS: readonly number[] = [
  Math.PI / 4,
  0,
  Math.PI,
  Math.PI / 2,
  -Math.PI / 2,
];

export function normalizeYaw(yaw: number): number {
  const twoPi = Math.PI * 2;
  let a = yaw % twoPi;
  if (a > Math.PI) a -= twoPi;
  if (a < -Math.PI) a += twoPi;
  return a;
}

export function homeHeroTurnaroundFrameIndex(yaw: number): number {
  const a = normalizeYaw(yaw);
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < FRAME_YAWS.length; i += 1) {
    const d = Math.abs(normalizeYaw(a - FRAME_YAWS[i]));
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}
