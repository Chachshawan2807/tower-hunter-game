import { useEffect } from "react";

interface UseBattleArenaKeyboardOptions {
  enabled: boolean;
  onSlot: (slotIndex: 0 | 1) => void;
}

export function useBattleArenaKeyboard({
  enabled,
  onSlot,
}: UseBattleArenaKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "1") {
        event.preventDefault();
        onSlot(0);
      } else if (event.key === "2") {
        event.preventDefault();
        onSlot(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onSlot]);
}
