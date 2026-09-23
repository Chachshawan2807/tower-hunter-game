import {
  getSkillIconId,
  SKILL_ICON_ASSETS_ENABLED,
  skillIconUrl,
} from "../../engine/skills/skillIcon";
import type { SkillDefinition } from "../../engine/skills/types";

interface SkillIconProps {
  skill: Pick<SkillDefinition, "iconId">;
  size?: number;
  /** Taller glyph when omitted, matches `size` (square). */
  height?: number;
  /** Fills `--skill-icon-w` / `--skill-icon-h` from parent tile. */
  layout?: "fixed" | "tile";
  className?: string;
  title?: string;
}

export function SkillIcon({
  skill,
  size = 32,
  height,
  layout = "fixed",
  className = "",
  title,
}: SkillIconProps) {
  const iconId = getSkillIconId(skill);
  const iconHeight = height ?? size;
  const isTile = layout === "tile";
  const useAsset = SKILL_ICON_ASSETS_ENABLED;

  return (
    <span
      className={[
        "skill-icon",
        isTile ? "skill-icon--tile" : "",
        useAsset ? "" : "skill-icon--placeholder",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...(isTile
          ? {}
          : { width: size, height: iconHeight }),
        ...(useAsset
          ? {
              ["--skill-icon-mask" as string]: `url(${skillIconUrl(iconId)})`,
            }
          : {}),
      }}
      data-icon-id={useAsset ? undefined : iconId}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    />
  );
}
