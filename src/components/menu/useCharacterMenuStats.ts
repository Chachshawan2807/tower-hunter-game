import { startTransition, useCallback, useEffect, useState } from "react";
import type { PlayerStatsResponse } from "../../utils/api";

type PlayerStats = NonNullable<PlayerStatsResponse["stats"]>;

/**
 * Instant stat display for the character menu while deferring heavy App re-renders.
 */
export function useCharacterMenuStats(
  stats: PlayerStats | null,
  onStatsChange?: (next: PlayerStats) => void
) {
  const [draft, setDraft] = useState<PlayerStats | null>(null);

  useEffect(() => {
    setDraft(null);
  }, [stats]);

  const displayStats = draft ?? stats;

  const pushStats = useCallback(
    (next: PlayerStats) => {
      setDraft(next);
      if (onStatsChange) {
        startTransition(() => {
          onStatsChange(next);
        });
      }
    },
    [onStatsChange]
  );

  return { displayStats, pushStats };
}
