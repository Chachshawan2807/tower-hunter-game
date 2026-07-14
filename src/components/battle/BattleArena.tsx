import type { AnimationEvent } from "../../engine/types";
import { t, type Locale } from "../../utils/i18n";

function formatEvent(event: AnimationEvent): string {
  switch (event.type) {
    case "damage":
      return `💥 ${event.value ?? 0} dmg`;
    case "miss":
      return "💨 Miss";
    case "critical":
      return `⚡ Crit ${event.value ?? ""}`;
    case "dot_damage":
      return `☠ DoT ${event.value ?? 0}`;
    case "battle_win":
      return "🏆 Win";
    case "battle_lose":
      return "💀 Lose";
    default:
      return event.type;
  }
}

interface BattleArenaProps {
  locale: Locale;
  events: AnimationEvent[];
  actionRequired: boolean;
  isComplete: boolean;
  result: "win" | "lose" | null;
  busy: boolean;
  onAttack: () => void;
  onContinue: () => void;
  onReset: () => void;
}

export function BattleArena({
  locale,
  events,
  actionRequired,
  isComplete,
  result,
  busy,
  onAttack,
  onContinue,
  onReset,
}: BattleArenaProps) {
  const recent = events.slice(-6);

  return (
    <div className="battle-arena">
      <div className="battle-entities">
        <div className="entity-card">
          <div className="entity-icon entity-icon--player">🧙</div>
          <div className="hp-bar">
            <div className="hp-bar__fill" style={{ width: "75%" }} />
          </div>
        </div>
        <span style={{ fontSize: "1.2rem", opacity: 0.5 }}>⚔</span>
        <div className="entity-card">
          <div className="entity-icon entity-icon--enemy">👹</div>
          <div className="hp-bar">
            <div className="hp-bar__fill hp-bar__fill--enemy" style={{ width: "60%" }} />
          </div>
        </div>
      </div>

      <div className="battle-log">
        {recent.length === 0 ? (
          <div className="battle-log__entry">...</div>
        ) : (
          recent.map((ev, i) => (
            <div key={i} className="battle-log__entry">
              {formatEvent(ev)}
            </div>
          ))
        )}
      </div>

      {isComplete && result && (
        <div className={`result-banner result-banner--${result}`}>
          {result === "win" ? t("battle.win", locale) : t("battle.lose", locale)}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {actionRequired && !isComplete && (
          <button className="action-btn" disabled={busy} onClick={onAttack}>
            {t("battle.attack", locale)}
          </button>
        )}
        {!isComplete && !actionRequired && !busy && (
          <button className="action-btn action-btn--secondary" onClick={onContinue}>
            {t("tower.auto", locale)}
          </button>
        )}
        {isComplete && (
          <button className="action-btn" onClick={onReset}>
            OK
          </button>
        )}
      </div>
    </div>
  );
}
