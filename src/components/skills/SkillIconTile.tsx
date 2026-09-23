import type { CSSProperties } from "react";
import type { SkillDefinition } from "../../engine/skills/types";
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

  const showLockOverlay = locked;
  const showFooter = showName || (badgeText && !locked);

  const content = (
    <>
      <span className="skill-icon-tile__blur-layer" aria-hidden>
        <span className="skill-icon-tile__icon-wrap">
          <SkillIcon skill={skill} layout="tile" />
        </span>
        {showFooter ? (
          <span className="skill-icon-tile__footer">
            {showName ? (
              <span className="skill-icon-tile__name">
                <span className="skill-icon-tile__name-inner">{label}</span>
              </span>
            ) : null}
            {badgeText && !locked ? (
              <span className="skill-icon-tile__meta">
                <span className="skill-icon-tile__badge tabular-nums">
                  {badgeText}
                </span>
              </span>
            ) : null}
          </span>
        ) : null}
      </span>
      {showLockOverlay ? (
        <span className="skill-icon-tile__lock-overlay" aria-hidden>
          {badgeText ? (
            <span className="skill-icon-tile__badge tabular-nums">
              {badgeText}
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
