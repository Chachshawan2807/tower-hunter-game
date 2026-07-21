import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonVariant = "primary" | "secondary" | "attack" | "climb";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  icon?: ReactNode;
  label: ReactNode;
}

const VARIANT_CLASS: Record<ActionButtonVariant, string> = {
  primary: "action-btn",
  secondary: "action-btn action-btn--secondary",
  attack: "action-btn action-btn--attack",
  climb: "action-btn action-btn--climb",
};

/** Shared combat / tower action control using design tokens. */
export function ActionButton({
  variant = "primary",
  icon,
  label,
  className,
  type = "button",
  ...props
}: ActionButtonProps) {
  const base = VARIANT_CLASS[variant];
  const classes = className ? `${base} ${className}` : base;

  return (
    <button type={type} className={classes} {...props}>
      {icon ? (
        <span className={`${base}__icon`} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={`${base}__label`}>{label}</span>
    </button>
  );
}
