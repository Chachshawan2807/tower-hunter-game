import type { ReactNode } from "react";
import { GameIcon } from "../ui/icons";

interface SkillListCardProps {
  label: string;
  meta: string;
  locked?: boolean;
  footer?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function SkillListCard({
  label,
  meta,
  locked = false,
  footer,
  onClick,
  disabled = false,
  className = "",
}: SkillListCardProps) {
  const classes = [
    "stat-item",
    locked ? "stat-item--locked" : "",
    onClick ? "stat-item--unlockable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className="skill-stat-label">
        {locked ? (
          <GameIcon
            name="lock"
            size={17}
            className="skill-stat-label__icon skill-stat-label__icon--locked"
          />
        ) : null}
        {label}
      </span>
      <span className="stat-item__value tabular-nums">{meta}</span>
      {footer}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        disabled={disabled}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
