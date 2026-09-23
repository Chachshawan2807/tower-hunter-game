import { useEffect, useRef } from "react";
import { isPointerOnScrollbar } from "./isPointerOnScrollbar";

/**
 * Invoke `onDismiss` on document pointerdown when `active` and the event target
 * is outside every selector in `ignoreSelectors` (closest-match).
 * Scrollbar gutter clicks on scroll containers are ignored so desktop scrolling works.
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

      if (isPointerOnScrollbar(target, event.clientX, event.clientY)) {
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
