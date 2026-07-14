import { ISO_COLORS as C } from "../../../../engine/art/characters/isoColors";

/** Shared SVG defs for isometric chibi figures */
export function IsoDefs({ prefix = "iso" }: { prefix?: string }) {
  const p = prefix;
  return (
    <defs>
      <radialGradient id={`${p}-skin`} cx="40%" cy="30%" r="65%">
        <stop offset="0%" stopColor={C.skinHi} />
        <stop offset="55%" stopColor={C.skin} />
        <stop offset="100%" stopColor={C.skinLo} />
      </radialGradient>
      <linearGradient id={`${p}-metal`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={C.metalHi} />
        <stop offset="50%" stopColor={C.metal} />
        <stop offset="100%" stopColor={C.metalLo} />
      </linearGradient>
      {/* Legacy id for WeaponSvg compatibility */}
      <linearGradient id="char-metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={C.metalHi} />
        <stop offset="50%" stopColor={C.metal} />
        <stop offset="100%" stopColor={C.metalLo} />
      </linearGradient>
      <radialGradient id={`${p}-demon`} cx="35%" cy="25%" r="70%">
        <stop offset="0%" stopColor={C.demonSkinHi} />
        <stop offset="100%" stopColor={C.demonSkin} />
      </radialGradient>
      <filter id={`${p}-soft`} x="-8%" y="-8%" width="116%" height="116%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.4" />
      </filter>
    </defs>
  );
}

/** Ground ellipse shadow */
export function IsoShadow({ cx = 60, cy = 178 }: { cx?: number; cy?: number }) {
  return <ellipse cx={cx} cy={cy} rx="28" ry="7" fill={C.shadow} />;
}

/** Minimal dot eyes (reference style) */
export function IsoEyes({
  cx = 60,
  cy = 52,
  spacing = 10,
  color = C.ink,
}: {
  cx?: number;
  cy?: number;
  spacing?: number;
  color?: string;
}) {
  return (
    <>
      <circle cx={cx - spacing / 2} cy={cy} r="2.5" fill={color} />
      <circle cx={cx + spacing / 2} cy={cy} r="2.5" fill={color} />
    </>
  );
}

/** Chibi head — large rounded capsule */
export function IsoHead({
  cx = 60,
  cy = 54,
  rx = 20,
  ry = 22,
  fill = "url(#iso-skin)",
}: {
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  fill?: string;
}) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} />;
}

/** Chibi torso — squat rounded body */
export function IsoTorso({
  cx = 60,
  top = 72,
  w = 32,
  h = 38,
  fill,
  stroke = C.ink,
}: {
  cx?: number;
  top?: number;
  w?: number;
  h?: number;
  fill: string;
  stroke?: string;
}) {
  const x = cx - w / 2;
  return (
    <rect
      x={x}
      y={top}
      width={w}
      height={h}
      rx={w * 0.35}
      fill={fill}
      stroke={stroke}
      strokeWidth="1.2"
    />
  );
}

/** Stubby chibi legs */
export function IsoLegs({
  cx = 60,
  top = 106,
  fill = C.murimRobe,
}: {
  cx?: number;
  top?: number;
  fill?: string;
}) {
  return (
    <>
      <ellipse cx={cx - 9} cy={top + 18} rx="9" ry="14" fill={fill} stroke={C.ink} strokeWidth="1" />
      <ellipse cx={cx + 9} cy={top + 18} rx="9" ry="14" fill={fill} stroke={C.ink} strokeWidth="1" />
    </>
  );
}

/** Sphere hands */
export function IsoHands({
  cx = 60,
  y = 88,
  skin = true,
}: {
  cx?: number;
  y?: number;
  skin?: boolean;
}) {
  const fill = skin ? "url(#iso-skin)" : C.metal;
  return (
    <>
      <circle cx={cx - 24} cy={y} r="7" fill={fill} stroke={C.ink} strokeWidth="0.8" />
      <circle cx={cx + 24} cy={y} r="7" fill={fill} stroke={C.ink} strokeWidth="0.8" />
    </>
  );
}
