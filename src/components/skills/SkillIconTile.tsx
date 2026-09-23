import type { SkillDefinition } from "../../engine/skills/types";
import { GameIcon } from "../ui/icons";
import { SkillIcon } from "./SkillIcon";

interface SkillIconTileProps {
  skill: SkillDefinition;
  label: string;
  locked?: boolean;
  badgeText?: string;
  size?: number;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export function SkillIconTile({
  skill,
  label,
  locked = false,
  badgeText,
  size = 40,
  disabled = false,
  className = "",
  onClick,
}: SkillIconTileProps) {
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
        <SkillIcon label={label} skill={skill} size={size} />
        {locked ? (
          <GameIcon
            name="lock"
            size={14}
            className="skill-icon-tile__lock"
          />
        ) : null}
      </span>
      {badgeText ? (
        <span className="skill-icon-tile__badge tabular-nums">{badgeText}</span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        disabled={disabled}
        aria-label={label}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={classes} aria-label={label}>
      {content}
    </div>
  );
}
