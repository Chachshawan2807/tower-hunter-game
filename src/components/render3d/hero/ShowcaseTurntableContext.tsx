import { useThree } from "@react-three/fiber";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import {
  normalizeShowcaseYaw,
  SHOWCASE_DRAG_RAD_PER_PX,
} from "./showcaseHeroTurntable";

type ShowcaseTurntableContextValue = {
  yawRef: { current: number };
};

const ShowcaseTurntableContext = createContext<ShowcaseTurntableContextValue | null>(
  null
);

export function useShowcaseTurntableYawRef(): ShowcaseTurntableContextValue {
  const ctx = useContext(ShowcaseTurntableContext);
  if (!ctx) {
    throw new Error("useShowcaseTurntableYawRef requires ShowcaseTurntableProvider");
  }
  return ctx;
}

function ShowcaseTurntableDragSurface() {
  const { gl } = useThree();
  const { yawRef } = useShowcaseTurntableYawRef();
  const dragRef = useRef({ active: false, pointerId: -1, lastX: 0 });

  useEffect(() => {
    const canvas = gl.domElement;

    const endDrag = (pointerId: number) => {
      if (dragRef.current.pointerId !== pointerId) return;
      dragRef.current.active = false;
      dragRef.current.pointerId = -1;
      try {
        canvas.releasePointerCapture(pointerId);
      } catch {
        /* already released */
      }
      canvas.style.cursor = "grab";
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragRef.current.active = true;
      dragRef.current.pointerId = event.pointerId;
      dragRef.current.lastX = event.clientX;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) {
        return;
      }
      const dx = event.clientX - dragRef.current.lastX;
      dragRef.current.lastX = event.clientX;
      yawRef.current = normalizeShowcaseYaw(
        yawRef.current + dx * SHOWCASE_DRAG_RAD_PER_PX
      );
    };

    const onPointerUp = (event: PointerEvent) => endDrag(event.pointerId);
    const onPointerCancel = (event: PointerEvent) => endDrag(event.pointerId);

    canvas.style.cursor = "grab";
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
  }, [gl, yawRef]);

  return null;
}

type ShowcaseTurntableProviderProps = {
  children: ReactNode;
  /** Starting orbit angle (0 = front). */
  initialYaw?: number;
};

export function ShowcaseTurntableProvider({
  children,
  initialYaw = 0,
}: ShowcaseTurntableProviderProps) {
  const yawRef = useRef(initialYaw);
  const value = useMemo(() => ({ yawRef }), []);

  return (
    <ShowcaseTurntableContext.Provider value={value}>
      <ShowcaseTurntableDragSurface />
      {children}
    </ShowcaseTurntableContext.Provider>
  );
}
