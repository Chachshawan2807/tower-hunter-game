import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { TurntablePointerSurface } from "./TurntablePointerSurface";

type ShowcaseTurntableContextValue = {
  yawRef: { current: number };
};

export const ShowcaseTurntableContext = createContext<ShowcaseTurntableContextValue | null>(
  null
);

export function useShowcaseTurntableYawRef(): ShowcaseTurntableContextValue {
  const ctx = useContext(ShowcaseTurntableContext);
  if (!ctx) {
    throw new Error("useShowcaseTurntableYawRef requires ShowcaseTurntableProvider");
  }
  return ctx;
}

function ShowcaseTurntablePointerSurface() {
  const { yawRef } = useShowcaseTurntableYawRef();
  const resolveYawRef = useCallback((_event: PointerEvent) => yawRef, [yawRef]);
  return <TurntablePointerSurface resolveYawRef={resolveYawRef} />;
}

type ShowcaseTurntableProviderProps = {
  children: ReactNode;
  /** Starting orbit angle (0 = front). */
  initialYaw?: number;
  /** When false, no pointer rotation (unused in battle — use BattleTurntableProvider). */
  enableDrag?: boolean;
};

export function ShowcaseTurntableProvider({
  children,
  initialYaw = 0,
  enableDrag = true,
}: ShowcaseTurntableProviderProps) {
  const yawRef = useRef(initialYaw);
  const value = useMemo(() => ({ yawRef }), []);

  return (
    <ShowcaseTurntableContext.Provider value={value}>
      {enableDrag ? <ShowcaseTurntablePointerSurface /> : null}
      {children}
    </ShowcaseTurntableContext.Provider>
  );
}
