import { getIconDef } from "./iconRegistry";
import type { GameIconName } from "./paths";

interface GameIconProps {
  name: GameIconName;
  size?: number;
  className?: string;
  color?: string;
  title?: string;
}

export function GameIcon({
  name,
  size = 24,
  className = "",
  color,
  title,
}: GameIconProps) {
  const def = getIconDef(name);

  return (
    <svg
      className={`game-icon game-icon--${name} ${className}`.trim()}
      width={size}
      height={size}
      viewBox={def.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      style={color ? { color } : undefined}
    >
      {title ? <title>{title}</title> : null}
      {def.paths.map((d, i) => {
        const fill = def.fills?.[i] ?? "currentColor";
        const stroke = def.strokes?.[i];
        const strokeWidth = def.strokeWidths?.[i];

        return (
          <path
            key={i}
            d={d}
            fill={fill === "none" ? "none" : fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}
