import { useCallback, useLayoutEffect, useRef } from "react";

function scrollTopToPinFloorAtBottom(
  scrollEl: HTMLElement,
  floorEl: HTMLElement,
): number {
  const scrollRect = scrollEl.getBoundingClientRect();
  const floorRect = floorEl.getBoundingClientRect();
  const floorBottomInContent =
    scrollEl.scrollTop + (floorRect.bottom - scrollRect.top);
  const raw = floorBottomInContent - scrollEl.clientHeight;
  const max = scrollEl.scrollHeight - scrollEl.clientHeight;
  return Math.max(0, Math.min(max, raw));
}

export function useTowerFloorScroll(currentFloor: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const floorRefs = useRef(new Map<number, HTMLElement>());
  const initialScrollDone = useRef(false);

  const registerFloor = useCallback((floor: number, el: HTMLElement | null) => {
    if (el) floorRefs.current.set(floor, el);
    else floorRefs.current.delete(floor);
  }, []);

  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const floorEl = floorRefs.current.get(currentFloor);
    if (!scrollEl || !floorEl) return;

    const apply = () => {
      const targetTop = scrollTopToPinFloorAtBottom(scrollEl, floorEl);
      scrollEl.scrollTo({
        top: targetTop,
        behavior: initialScrollDone.current ? "smooth" : "auto",
      });
      initialScrollDone.current = true;
    };

    apply();
    if (scrollEl.clientHeight === 0) {
      requestAnimationFrame(apply);
    }
  }, [currentFloor]);

  return { scrollRef, registerFloor };
}
