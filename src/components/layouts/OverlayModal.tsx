import type { ReactNode } from "react";
import { t, type Locale } from "../../utils/i18n";

interface OverlayModalProps {
  title: string;
  locale: Locale;
  onClose: () => void;
  children: ReactNode;
}

export function OverlayModal({
  title,
  locale,
  onClose,
  children,
}: OverlayModalProps) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay__panel" onClick={(e) => e.stopPropagation()}>
        <header className="overlay__header">
          <h2 className="overlay__title">{title}</h2>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label={t("menu.close", locale)}
          >
            ✕
          </button>
        </header>
        <div className="overlay__body">{children}</div>
      </div>
    </div>
  );
}
