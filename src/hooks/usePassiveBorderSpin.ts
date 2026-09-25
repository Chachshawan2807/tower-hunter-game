import { useEffect, useRef } from "react";

const SPIN_PERIOD_MS = 4800;

/** Rotates `.passive-skill-spin__ring` via transform (not CSS animation). */
export function usePassiveBorderSpin(active: boolean) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return;

    const startedAt = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const elapsed = (now - startedAt) % SPIN_PERIOD_MS;
      const degrees = (elapsed / SPIN_PERIOD_MS) * 360;
      node.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [active]);

  return ref;
}
