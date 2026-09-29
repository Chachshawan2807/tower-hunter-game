import { useCallback, useEffect, useState } from "react";

import {
  BATTLE_3D_PREF_CHANGED,
  isBattle3dEnabled,
  writeBattle3dUserPreference,
} from "../utils/render3dEnv";

/** Reactive battle/home WebGL toggle (Settings + env flags). */
export function useBattle3dEnabled(): boolean {
  const [enabled, setEnabled] = useState(() => isBattle3dEnabled());

  useEffect(() => {
    const sync = () => setEnabled(isBattle3dEnabled());
    window.addEventListener(BATTLE_3D_PREF_CHANGED, sync);
    window.addEventListener("storage", sync);
    sync();
    return () => {
      window.removeEventListener(BATTLE_3D_PREF_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return enabled;
}

export function useBattle3dSetting() {
  const battle3dEnabled = useBattle3dEnabled();
  const setBattle3dEnabled = useCallback((enabled: boolean) => {
    writeBattle3dUserPreference(enabled);
  }, []);

  return { battle3dEnabled, setBattle3dEnabled };
}
