import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { GameIcon } from "../ui/icons";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { t, type Locale } from "../../utils/i18n";

interface OverlayModalProps {
  title: ReactNode;
  titleLabel?: string;
  locale: Locale;
  onClose: () => void;
  children: ReactNode;
}

const CLOSE_ANIM_MS = 220;

export function OverlayModal({
  title,
  titleLabel,
  locale,
  onClose,
  children,
}: OverlayModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  useFocusTrap(panelRef, !closing);

  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, CLOSE_ANIM_MS);
  }, [closing, onClose]);

  useEffect(() => {
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [requestClose]);

  return (
    <div
      className={`overlay view-readable${closing ? " overlay--closing" : ""}`}
      onClick={requestClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="overlay__panel texture-monolithic-walls"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="overlay-title"
      >
        <header className="overlay__header">
          <h2
            className="overlay__title"
            id="overlay-title"
            aria-label={titleLabel}
          >
            {title}
          </h2>
          <button
            ref={closeRef}
            className="icon-btn icon-btn--close"
            onClick={requestClose}
            aria-label={t("menu.close", locale)}
          >
            <GameIcon name="close" size={22} />
          </button>
        </header>
        <div className="overlay__body">{children}</div>
      </div>
    </div>
  );
}
