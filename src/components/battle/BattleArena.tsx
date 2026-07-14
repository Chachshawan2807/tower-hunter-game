import type { AnimationEvent, BattleSnapshot } from "../../engine/types";
import type { AnimationSpeed } from "../../hooks/useAnimationQueue";
import { t, type Locale } from "../../utils/i18n";

function formatEvent(event: AnimationEvent): string {
  switch (event.type) {
    case "damage":
      return `💥 ${event.value ?? 0}`;
    case "miss":
      return "💨";
    case "critical":
      return `⚡ ${event.value ?? ""}`;
    case "dot_damage":
      return `☠ ${event.value ?? 0}`;
    case "battle_win":
      return "🏆";
    case "battle_lose":
      return "💀";
    default:
      return "•";
  }
}

function getEntityHp(snapshot: BattleSnapshot | null, side: "player" | "enemy") {
  const entity = snapshot?.entities.find((e) => e.side === side);
  if (!entity) return { hp: 0, maxHp: 1, percent: 0 };
  const percent = Math.max(0, (entity.stats.hp / entity.stats.maxHp) * 100);
  return { hp: entity.stats.hp, maxHp: entity.stats.maxHp, percent };
}

interface BattleArenaProps {
  locale: Locale;
  snapshot: BattleSnapshot | null;
  displayedEvents: AnimationEvent[];
  actionRequired: boolean;
  isComplete: boolean;
  result: "win" | "lose" | null;
  busy: boolean;
  isPlaying: boolean;
  speed: AnimationSpeed;
  onSpeedChange: (speed: AnimationSpeed) => void;
  onSkip: () => void;
  onAttack: () => void;
  onContinue: () => void;
  onReset: () => void;
}

export function BattleArena({
  locale,
  snapshot,
  displayedEvents,
  actionRequired,
  isComplete,
  result,
  busy,
  isPlaying,
  speed,
  onSpeedChange,
  onSkip,
  onAttack,
  onContinue,
  onReset,
}: BattleArenaProps) {
  const player = getEntityHp(snapshot, "player");
  const enemy = getEntityHp(snapshot, "enemy");
  const recent = displayedEvents.slice(-6);

  return (
    <div className="battle-arena">
      <div className="battle-controls">
        <button
          className={`speed-btn ${speed === 2 ? "speed-btn--active" : ""}`}
          onClick={() => onSpeedChange(2)}
          disabled={!isPlaying}
          aria-label="Speed x2"
        >
          ×2
        </button>
        <button
          className={`speed-btn ${speed === 4 ? "speed-btn--active" : ""}`}
          onClick={() => onSpeedChange(4)}
          disabled={!isPlaying}
          aria-label="Speed x4"
        >
          ×4
        </button>
        <button
          className="speed-btn speed-btn--skip"
          onClick={onSkip}
          disabled={!isPlaying}
          aria-label="Skip"
        >
          ⏭
        </button>
      </div>

      <div className="battle-entities">
        <div className="entity-card">
          <div className="entity-icon entity-icon--player">🧙</div>
          <div className="hp-bar">
            <div
              className="hp-bar__fill"
              style={{ width: `${player.percent}%` }}
            />
          </div>
        </div>
        <span className="battle-vs">⚔</span>
        <div className="entity-card">
          <div className="entity-icon entity-icon--enemy">👹</div>
          <div className="hp-bar">
            <div
              className="hp-bar__fill hp-bar__fill--enemy"
              style={{ width: `${enemy.percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="battle-log">
        {recent.length === 0 ? (
          <div className="battle-log__entry">—</div>
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

      <div className="battle-actions">
        {actionRequired && !isComplete && !isPlaying && (
          <button className="action-btn" disabled={busy} onClick={onAttack}>
            ⚔
          </button>
        )}
        {!isComplete && !actionRequired && !busy && !isPlaying && (
          <button className="action-btn action-btn--secondary" onClick={onContinue}>
            ▶
          </button>
        )}
        {isComplete && !isPlaying && (
          <button className="action-btn" onClick={onReset}>
            ✓
          </button>
        )}
      </div>
    </div>
  );
}
