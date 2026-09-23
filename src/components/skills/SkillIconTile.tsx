import type { CSSProperties } from "react";
import type { SkillDefinition } from "../../engine/skills/types";
import { GameIcon } from "../ui/icons";
import { SkillIcon } from "./SkillIcon";

interface SkillIconTileProps {
  skill: SkillDefinition;
  label: string;
  locked?: boolean;
  badgeText?: string;
  size?: number;
  iconHeight?: number;
  disabled?: boolean;
  /** Visible skill name above SP row; off for compact battle/picker tiles. */
  showName?: boolean;
  className?: string;
  onClick?: () => void;
}

export function SkillIconTile({
  skill,
  label,
  locked = false,
  badgeText,
  size,
  iconHeight,
  disabled = false,
  showName = true,
  className = "",
  onClick,
}: SkillIconTileProps) {
  const tileStyle =
    size != null || iconHeight != null
      ? ({
          ...(size != null
            ? { ["--skill-icon-w" as string]: `${size}px` }
            : {}),
          ...(iconHeight != null
            ? { ["--skill-icon-h" as string]: `${iconHeight}px` }
            : {}),
        } as CSSProperties)
      : undefined;

  const classes = [
    "skill-icon-tile",
    locked ? "skill-icon-tile--locked" : "",
    onClick ? "skill-icon-tile--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className="skill-icon-tile__icon-wrap" aria-hidden>
        <SkillIcon skill={skill} layout="tile" />
      </span>
      {showName || badgeText || locked ? (
        <span className="skill-icon-tile__footer" aria-hidden>
          {showName ? (
            <span className="skill-icon-tile__name">{label}</span>
          ) : null}
          {badgeText || locked ? (
            <span className="skill-icon-tile__meta">
              {locked ? (
                <GameIcon
                  name="lock"
                  size={12}
                  className="skill-icon-tile__lock"
                />
              ) : null}
              {badgeText ? (
                <span className="skill-icon-tile__badge tabular-nums">
                  {badgeText}
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        style={tileStyle}
        disabled={disabled}
        aria-label={label}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={classes} style={tileStyle} aria-label={label}>
      {content}
    </div>
  );
}
