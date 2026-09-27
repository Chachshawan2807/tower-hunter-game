import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type MutableRefObject } from "react";

import {
  normalizeShowcaseYaw,
  SHOWCASE_CLICK_MAX_MOVE_PX,
  SHOWCASE_CLICK_MAX_MS,
  SHOWCASE_CLICK_STEP_RAD,
  SHOWCASE_HOLD_RAD_PER_SEC,
} from "./showcaseHeroTurntable";

type TurntablePointerSurfaceProps = {
  resolveYawRef: (event: PointerEvent) => MutableRefObject<number> | null;
};

export function TurntablePointerSurface({ resolveYawRef }: TurntablePointerSurfaceProps) {
  const { gl } = useThree();
  const sessionRef = useRef({
    holding: false,
    pointerId: -1,
    yawRef: null as MutableRefObject<number> | null,
    downAt: 0,
    downX: 0,
    downY: 0,
    maxMove: 0,
  });

  useFrame((_, delta) => {
    const session = sessionRef.current;
    if (!session.holding || !session.yawRef) return;
    if (performance.now() - session.downAt < SHOWCASE_CLICK_MAX_MS) return;
    session.yawRef.current = normalizeShowcaseYaw(
      session.yawRef.current + SHOWCASE_HOLD_RAD_PER_SEC * delta
    );
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const endSession = (event: PointerEvent) => {
      const session = sessionRef.current;
      if (session.pointerId !== event.pointerId) return;

      const elapsed = performance.now() - session.downAt;
      const isClick =
        elapsed <= SHOWCASE_CLICK_MAX_MS && session.maxMove <= SHOWCASE_CLICK_MAX_MOVE_PX;

      if (isClick && session.yawRef) {
        session.yawRef.current = normalizeShowcaseYaw(
          session.yawRef.current + SHOWCASE_CLICK_STEP_RAD
        );
      }

      session.holding = false;
      session.pointerId = -1;
      session.yawRef = null;
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
      canvas.style.cursor = "pointer";
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const yawRef = resolveYawRef(event);
      if (!yawRef) return;

      sessionRef.current.holding = true;
      sessionRef.current.pointerId = event.pointerId;
      sessionRef.current.yawRef = yawRef;
      sessionRef.current.downAt = performance.now();
      sessionRef.current.downX = event.clientX;
      sessionRef.current.downY = event.clientY;
      sessionRef.current.maxMove = 0;

      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      const session = sessionRef.current;
      if (!session.holding || session.pointerId !== event.pointerId) return;
      const dx = event.clientX - session.downX;
      const dy = event.clientY - session.downY;
      session.maxMove = Math.max(session.maxMove, Math.hypot(dx, dy));
    };

    const onPointerUp = (event: PointerEvent) => endSession(event);
    const onPointerCancel = (event: PointerEvent) => endSession(event);

    canvas.style.cursor = "pointer";
    canvas.style.touchAction = "none";

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.style.cursor = "";
      canvas.style.touchAction = "";
    };
  }, [gl, resolveYawRef]);

  return null;
}
