import type { AnimationEvent, BattleSnapshot } from "../../engine/types";
import type { Locale } from "../../utils/i18n";
import { formatBattleEvent, getBattleEventClass } from "./battleLog";

interface BattleArenaLogProps {
  locale: Locale;
  snapshot: BattleSnapshot | null;
  events: AnimationEvent[];
}

export function BattleArenaLog({ locale, snapshot, events }: BattleArenaLogProps) {
  return (
    <div
      className="battle-log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Battle events"
    >
      {events.length === 0 ? (
        <div className="battle-log__entry battle-log__entry--idle">—</div>
      ) : (
        events.map((ev, i) => (
          <div
            key={`${ev.type}-${i}-${ev.value ?? ""}`}
            className={`battle-log__entry ${getBattleEventClass(ev)}`.trim()}
          >
            <span className="battle-log__text">
              {formatBattleEvent(ev, locale, snapshot?.entities)}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
