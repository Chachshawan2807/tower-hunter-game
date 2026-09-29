import { useCallback, useLayoutEffect, useRef } from "react";

import { towerScrollTopForFloor } from "../components/battle/towerScrollPosition";

function pinFloorAtBottom(
  scrollEl: HTMLElement,
  floorEl: HTMLElement,
  floor: number
): void {
  const grid = floorEl.closest<HTMLElement>(".tower-floor-grid");
  if (!grid) return;

  const cell = floorEl.closest<HTMLElement>(".tower-floor-grid__cell");
  if (cell) {
    cell.style.contentVisibility = "visible";
  }

  scrollEl.scrollTop = towerScrollTopForFloor(floor, scrollEl, grid);

  const cellRect = cell?.getBoundingClientRect();
  const scrollRect = scrollEl.getBoundingClientRect();
  if (cell && cellRect && cellRect.height > 0) {
    const floorBottomInContent =
      scrollEl.scrollTop + (cellRect.bottom - scrollRect.top);
    const refined = Math.max(
      0,
      Math.min(
        scrollEl.scrollHeight - scrollEl.clientHeight,
        floorBottomInContent - scrollEl.clientHeight
      )
    );
    scrollEl.scrollTop = refined;
  }
}

export function useTowerFloorScroll(
  currentFloor: number,
  focusGeneration = 0
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const floorRefs = useRef(new Map<number, HTMLElement>());
  const registerFloor = useCallback((floor: number, el: HTMLElement | null) => {
    if (el) floorRefs.current.set(floor, el);
    else floorRefs.current.delete(floor);
  }, []);

  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || currentFloor < 1) return;

    const run = () => {
      const floorEl = floorRefs.current.get(currentFloor);
      if (!floorEl) return false;
      pinFloorAtBottom(scrollEl, floorEl, currentFloor);
      return true;
    };

    scrollEl.classList.add("tower-scroll--snapping");
    let ok = run();
    if (!ok) {
      requestAnimationFrame(() => {
        run();
      });
    }

    requestAnimationFrame(() => {
      run();
      requestAnimationFrame(() => {
        run();
        scrollEl.classList.remove("tower-scroll--snapping");
      });
    });

    const ro = new ResizeObserver(() => {
      run();
    });
    ro.observe(scrollEl);

    return () => {
      ro.disconnect();
      scrollEl.classList.remove("tower-scroll--snapping");
    };
  }, [currentFloor, focusGeneration]);

  return { scrollRef, registerFloor };
}
