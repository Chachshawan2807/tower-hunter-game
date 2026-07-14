import { useAudioSettings } from "../../hooks/useAudioSettings";
import { t, type Locale } from "../../utils/i18n";

interface SettingsMenuProps {
  locale: Locale;
  onToggleLocale: () => void;
}

export function SettingsMenu({ locale, onToggleLocale }: SettingsMenuProps) {
  const { settings, setMuted, setMusicVolume, setSfxVolume } = useAudioSettings();

  return (
    <div className="settings-menu">
      <section className="settings-section ui-section" aria-labelledby="settings-audio-title">
        <h3 className="settings-section__title ui-section__title" id="settings-audio-title">
          {t("settings.audio", locale)}
        </h3>

        <label className="settings-row">
          <span>{t("settings.mute", locale)}</span>
          <input
            type="checkbox"
            checked={settings.muted}
            onChange={(e) => setMuted(e.target.checked)}
          />
        </label>

        <label className="settings-row">
          <span>{t("settings.music_volume", locale)}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.musicVolume * 100)}
            onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
            disabled={settings.muted}
          />
        </label>

        <label className="settings-row">
          <span>{t("settings.sfx_volume", locale)}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.sfxVolume * 100)}
            onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
            disabled={settings.muted}
          />
        </label>
      </section>

      <section className="settings-section ui-section" aria-labelledby="settings-display-title">
        <h3 className="settings-section__title ui-section__title" id="settings-display-title">
          {t("settings.display", locale)}
        </h3>

        <label className="settings-row">
          <span>{t("settings.lang", locale)}</span>
          <button type="button" className="settings-lang-btn" onClick={onToggleLocale}>
            {locale === "en" ? "ไทย (TH)" : "English (EN)"}
          </button>
        </label>
      </section>
    </div>
  );
}
