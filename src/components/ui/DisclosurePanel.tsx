import type { ReactNode } from "react";

interface DisclosurePanelProps {
  id: string;
  expanded: boolean;
  children: ReactNode;
  className?: string;
}

/** Height-animated expand/collapse panel (grid 0fr → 1fr). */
export function DisclosurePanel({
  id,
  expanded,
  children,
  className = "",
}: DisclosurePanelProps) {
  return (
    <div
      id={id}
      className={[
        "ui-disclosure",
        expanded ? "ui-disclosure--open" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={!expanded}
    >
      <div className="ui-disclosure__inner">{children}</div>
    </div>
  );
}
