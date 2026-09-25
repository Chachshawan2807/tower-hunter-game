interface SettingsToggleProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function SettingsToggle({
  checked,
  disabled,
  label,
  onChange,
}: SettingsToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      className={`settings-toggle${checked ? " settings-toggle--on" : ""}`}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="settings-toggle__track" aria-hidden>
        <span className="settings-toggle__thumb" />
      </span>
    </button>
  );
}
