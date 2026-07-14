import type { ReactNode } from "react";
import { t, type Locale } from "../../utils/i18n";

interface GameShellProps {
  locale: Locale;
  children: ReactNode;
}

export function GameShell({ locale, children }: GameShellProps) {
  return (
    <div className="desktop-shell">
      <aside className="side-panel">
        <span className="side-panel__title">{t("side.log", locale)}</span>
        <div className="side-panel__placeholder">—</div>
      </aside>

      <main className="game-frame">{children}</main>

      <aside className="side-panel">
        <span className="side-panel__title">{t("side.chat", locale)}</span>
        <div className="side-panel__placeholder">—</div>
      </aside>
    </div>
  );
}
