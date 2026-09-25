interface SettingsVolumeSliderProps {
  label: string;
  valuePercent: number;
  disabled?: boolean;
  onChange: (valuePercent: number) => void;
}

export function SettingsVolumeSlider({
  label,
  valuePercent,
  disabled,
  onChange,
}: SettingsVolumeSliderProps) {
  const clamped = Math.max(0, Math.min(100, valuePercent));

  return (
    <div
      className={`settings-volume${disabled ? " settings-volume--disabled" : ""}`}
    >
      <div className="settings-volume__head">
        <span className="settings-volume__label">{label}</span>
        <span className="settings-volume__value tabular-nums" aria-hidden>
          {clamped}%
        </span>
      </div>
      <div className="settings-volume__track-wrap">
        <div
          className="settings-volume__fill"
          style={{ width: `${clamped}%` }}
          aria-hidden
        />
        <input
          type="range"
          className="settings-volume__input"
          min={0}
          max={100}
          value={clamped}
          disabled={disabled}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clamped}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
