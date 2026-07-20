import { useEffect, useRef } from "react";

/**
 * Invoke `onDismiss` on document pointerdown when `active` and the event target
 * is outside every selector in `ignoreSelectors` (closest-match).
 */
export function useDismissOnOutside(
  active: boolean,
  onDismiss: () => void,
  ignoreSelectors: readonly string[]
) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const ignoreRef = useRef(ignoreSelectors);
  ignoreRef.current = ignoreSelectors;

  useEffect(() => {
    if (!active) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        onDismissRef.current();
        return;
      }

      for (const selector of ignoreRef.current) {
        if (target.closest(selector)) return;
      }

      onDismissRef.current();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [active]);
}
