import { t, type Locale } from "../../utils/i18n";

interface SettingsLocaleToggleProps {
  locale: Locale;
  onToggle: () => void;
}

export function SettingsLocaleToggle({ locale, onToggle }: SettingsLocaleToggleProps) {
  const select = (next: Locale) => {
    if (next !== locale) onToggle();
  };

  return (
    <div
      className="settings-locale-segment"
      role="radiogroup"
      aria-label={t("settings.lang", locale)}
    >
      <button
        type="button"
        role="radio"
        className={`settings-locale-segment__btn${
          locale === "en" ? " settings-locale-segment__btn--active" : ""
        }`}
        aria-checked={locale === "en"}
        onClick={() => select("en")}
      >
        EN
      </button>
      <button
        type="button"
        role="radio"
        className={`settings-locale-segment__btn${
          locale === "th" ? " settings-locale-segment__btn--active" : ""
        }`}
        aria-checked={locale === "th"}
        onClick={() => select("th")}
      >
        TH
      </button>
    </div>
  );
}
