import { useEffect } from "react";

interface UseBattleArenaKeyboardOptions {
  enabled: boolean;
  onSlot: (slotIndex: number) => void;
  slotCount?: number;
}

export function useBattleArenaKeyboard({
  enabled,
  onSlot,
  slotCount = 4,
}: UseBattleArenaKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index >= 0 && index < slotCount) {
        event.preventDefault();
        onSlot(index);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onSlot, slotCount]);
}
