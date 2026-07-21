import type { AnimationSpeed } from "../../hooks/useAnimationQueue";

interface BattleArenaControlsProps {
  speed: AnimationSpeed;
  isPlaying: boolean;
  onSpeedChange: (speed: AnimationSpeed) => void;
  onSkip: () => void;
}

export function BattleArenaControls({
  speed,
  isPlaying,
  onSpeedChange,
  onSkip,
}: BattleArenaControlsProps) {
  return (
    <div className="battle-controls" aria-label="Playback speed">
      <button
        className={`speed-btn ${speed === 2 ? "speed-btn--active" : ""}`}
        onClick={() => onSpeedChange(2)}
        disabled={!isPlaying}
        aria-label="Speed x2"
        aria-pressed={speed === 2}
      >
        ×2
      </button>
      <button
        className={`speed-btn ${speed === 4 ? "speed-btn--active" : ""}`}
        onClick={() => onSpeedChange(4)}
        disabled={!isPlaying}
        aria-label="Speed x4"
        aria-pressed={speed === 4}
      >
        ×4
      </button>
      <button
        className="speed-btn speed-btn--skip"
        onClick={onSkip}
        disabled={!isPlaying}
        aria-label="Skip animation"
      >
        Skip
      </button>
    </div>
  );
}
