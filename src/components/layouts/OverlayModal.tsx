import { useCallback, useEffect, useId, useRef, useState } from "react";
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
  /** `sheet` = bottom drawer; `dialog` = centered floating panel */
  variant?: "sheet" | "dialog";
}

const CLOSE_FALLBACK_MS = 400;

export function OverlayModal({
  title,
  titleLabel,
  locale,
  onClose,
  children,
  variant = "sheet",
}: OverlayModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [closing, setClosing] = useState(false);

  useFocusTrap(panelRef, !closing);

  const finishClose = useCallback(() => {
    onClose();
    requestAnimationFrame(() => {
      const prev = previousFocusRef.current;
      if (prev?.isConnected) prev.focus();
    });
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
  }, [closing]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [requestClose]);

  useEffect(() => {
    if (!closing) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      finishClose();
      return;
    }

    const panel = panelRef.current;
    if (!panel) {
      finishClose();
      return;
    }

    const onAnimEnd = (e: AnimationEvent) => {
      if (e.target !== panel) return;
      finishClose();
    };

    panel.addEventListener("animationend", onAnimEnd);
    const fallback = window.setTimeout(finishClose, CLOSE_FALLBACK_MS);
    return () => {
      panel.removeEventListener("animationend", onAnimEnd);
      window.clearTimeout(fallback);
    };
  }, [closing, finishClose]);

  return (
    <div
      className={`overlay overlay--${variant} view-readable${closing ? " overlay--closing" : ""}`}
      data-state={closing ? "closing" : "open"}
      onClick={requestClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="overlay__panel texture-monolithic-walls"
        data-state={closing ? "closing" : "open"}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="overlay__header">
          <h2
            className="overlay__title"
            id={titleId}
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
