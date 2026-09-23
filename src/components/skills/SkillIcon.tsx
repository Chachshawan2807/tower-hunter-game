import type { SkillDefinition } from "../../engine/skills/types";

interface SkillIconProps {
  /** Localized skill name (placeholder until SVG icons return). */
  label: string;
  skill?: Pick<SkillDefinition, "iconId">;
  size?: number;
  className?: string;
  title?: string;
}

export function SkillIcon({
  label,
  size = 32,
  className = "",
  title,
}: SkillIconProps) {
  const fontSize = Math.max(0.45, Math.min(0.72, size / 44)).toFixed(2);

  return (
    <span
      className={`skill-icon skill-icon--name ${className}`.trim()}
      style={{
        width: size,
        minHeight: size,
        fontSize: `${fontSize}rem`,
      }}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title ?? label}
    >
      {label}
    </span>
  );
}
