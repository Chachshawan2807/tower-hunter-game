interface ResetUndoIconProps {
  size?: number;
  className?: string;
}

/**
 * Traced from Downloads reference (pngtree circular arrow icon).
 * PNG has alpha — safe for CSS mask + currentColor (not opaque square).
 */
export function ResetUndoIcon({ size = 20, className = "" }: ResetUndoIconProps) {
  return (
    <span
      className={`game-icon game-icon--file game-icon--reset-undo ${className}`.trim()}
      style={{
        width: size,
        height: size,
        ["--icon-mask" as string]: "url(/icons/ui/reset-undo.png)",
      }}
      aria-hidden
    />
  );
}
