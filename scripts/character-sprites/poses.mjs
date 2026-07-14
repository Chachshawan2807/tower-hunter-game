/** 4×4 sheet pose offsets — rows: idle, attack, hit_cc, defeat */
export const ROW_ANIMS = [
  [
    { dx: 0, dy: 4 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: 4 },
    { dx: 0, dy: 2 },
  ],
  [
    { dx: 0, dy: 3 },
    { dx: 6, dy: 2 },
    { dx: 12, dy: 0 },
    { dx: 5, dy: 2 },
  ],
  [
    { dx: -3, dy: 3 },
    { dx: -8, dy: 2, rot: -4 },
    { dx: -6, dy: 4 },
    { dx: -3, dy: 5 },
  ],
  [
    { dx: 0, dy: 4, rot: -5, op: 1 },
    { dx: 0, dy: 12, rot: -14, op: 0.85 },
    { dx: 0, dy: 20, rot: -24, op: 0.5 },
    { dx: 0, dy: 28, rot: -32, op: 0.22 },
  ],
];
