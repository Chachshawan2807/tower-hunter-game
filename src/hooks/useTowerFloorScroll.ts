import { useCallback, useEffect, useRef } from "react";

export function useTowerFloorScroll(currentFloor: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const floorRefs = useRef(new Map<number, HTMLElement>());
  const initialScrollDone = useRef(false);

  const registerFloor = useCallback((floor: number, el: HTMLElement | null) => {
    if (el) floorRefs.current.set(floor, el);
    else floorRefs.current.delete(floor);
  }, []);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const floorEl = floorRefs.current.get(currentFloor);
    if (!scrollEl || !floorEl) return;

    const targetTop =
      floorEl.offsetTop - scrollEl.clientHeight / 2 + floorEl.offsetHeight / 2;

    scrollEl.scrollTo({
      top: targetTop,
      behavior: initialScrollDone.current ? "smooth" : "auto",
    });
    initialScrollDone.current = true;
  }, [currentFloor]);

  return { scrollRef, registerFloor };
}
