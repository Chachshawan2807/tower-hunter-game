import { useAudioSettings } from "../../hooks/useAudioSettings";
import { t, type Locale } from "../../utils/i18n";
import { SettingsLocaleToggle } from "./SettingsLocaleToggle";
import { SettingsToggle } from "./SettingsToggle";
import { SettingsVolumeSlider } from "./SettingsVolumeSlider";

interface SettingsMenuProps {
  locale: Locale;
  onToggleLocale: () => void;
}

export function SettingsMenu({ locale, onToggleLocale }: SettingsMenuProps) {
  const { settings, setMuted, setMusicVolume, setSfxVolume } = useAudioSettings();

  return (
    <div className="settings-menu">
      <section className="settings-section" aria-label={t("settings.audio", locale)}>
        <div className="settings-section__body">
          <div className="settings-item">
            <span className="settings-item__label">{t("settings.mute", locale)}</span>
            <SettingsToggle
              label={t("settings.mute", locale)}
              checked={settings.muted}
              onChange={setMuted}
            />
          </div>

          <SettingsVolumeSlider
            label={t("settings.music_volume", locale)}
            valuePercent={Math.round(settings.musicVolume * 100)}
            disabled={settings.muted}
            onChange={(v) => setMusicVolume(v / 100)}
          />

          <SettingsVolumeSlider
            label={t("settings.sfx_volume", locale)}
            valuePercent={Math.round(settings.sfxVolume * 100)}
            disabled={settings.muted}
            onChange={(v) => setSfxVolume(v / 100)}
          />
        </div>
      </section>

      <section className="settings-section" aria-label={t("settings.display", locale)}>
        <div className="settings-section__body">
          <div className="settings-item">
            <span className="settings-item__label">{t("settings.lang", locale)}</span>
            <SettingsLocaleToggle locale={locale} onToggle={onToggleLocale} />
          </div>
        </div>
      </section>
    </div>
  );
}
