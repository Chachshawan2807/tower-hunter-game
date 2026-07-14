import type { ReactNode } from "react";
import { getTowerZone, zoneBackgroundUrl, type TowerZoneId } from "../../engine/art";
import { t, type Locale } from "../../utils/i18n";

interface GameShellProps {
  locale: Locale;
  battleLog?: string[];
  homeMode?: boolean;
  towerFloor?: number;
  children: ReactNode;
}

function EnvironmentBackdrop({
  variant = "tower",
  zoneId,
}: {
  variant?: "tower" | "home";
  zoneId?: TowerZoneId;
}) {
  return (
    <div className={`env-backdrop env-backdrop--${variant}`} aria-hidden="true">
      {zoneId ? (
        <img
          className="env-zone-bg"
          src={zoneBackgroundUrl(zoneId)}
          alt=""
          decoding="async"
        />
      ) : null}
      <div className="env-illustration" />
      <div className="env-wall env-wall--left" />
      <div className="env-wall env-wall--right" />
      {variant === "tower" ? (
        <>
          <div className="env-chains" />
          <div className="env-fog" />
          <div className="env-rain" />
        </>
      ) : (
        <div className="env-fog env-fog--home" />
      )}
    </div>
  );
}

export function GameShell({
  locale,
  battleLog = [],
  homeMode = false,
  towerFloor,
  children,
}: GameShellProps) {
  const recentLog = battleLog.slice(-12);
  const zone = towerFloor !== undefined ? getTowerZone(towerFloor) : null;
  const zoneClass = zone?.cssClass ?? "";

  const frameClass = [
    "game-frame",
    homeMode ? "game-frame--home" : "",
    zoneClass,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="desktop-shell">
      <aside className="side-panel" aria-label={t("side.log", locale)}>
        <span className="side-panel__title">{t("side.log", locale)}</span>
        <div
          className="side-panel__content"
          aria-live="polite"
          aria-relevant="additions"
        >
          {recentLog.length === 0 ? (
            <span className="side-panel__empty">—</span>
          ) : (
            recentLog.map((entry, i) => (
              <div key={i} className="side-panel__log-entry">
                {entry}
              </div>
            ))
          )}
        </div>
      </aside>

      <main className={frameClass}>
        {homeMode ? <EnvironmentBackdrop variant="home" /> : null}
        {zone ? (
          <EnvironmentBackdrop variant="tower" zoneId={zone.id} />
        ) : null}
        {children}
      </main>

      <aside className="side-panel" aria-label={t("side.chat", locale)}>
        <span className="side-panel__title">{t("side.chat", locale)}</span>
        <div className="side-panel__content side-panel__content--chat">
          <span className="side-panel__empty">{t("side.chat_soon", locale)}</span>
        </div>
      </aside>
    </div>
  );
}
