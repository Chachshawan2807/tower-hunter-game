import { useEffect, useId, useRef } from "react";
import { t, type Locale } from "../../utils/i18n";

export interface ConfirmDialogProps {
  locale: Locale;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  confirmTone?: "gold" | "crimson";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  locale,
  title,
  message,
  confirmLabel,
  cancelLabel,
  busy = false,
  confirmTone = "gold",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        event.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onCancel]);

  return (
    <div
      className="confirm-dialog-layer"
      role="presentation"
      onPointerDown={(e) => {
        if (busy || e.target !== e.currentTarget) return;
        onCancel();
      }}
    >
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <h3 className="confirm-dialog__title" id={titleId}>
          {title}
        </h3>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="confirm-dialog__btn confirm-dialog__btn--cancel"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel ?? t("dialog.cancel", locale)}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`confirm-dialog__btn confirm-dialog__btn--confirm${
              confirmTone === "crimson" ? " confirm-dialog__btn--confirm-crimson" : ""
            }`}
            disabled={busy}
            onClick={onConfirm}
          >
            {confirmLabel ?? t("dialog.confirm", locale)}
          </button>
        </div>
      </div>
    </div>
  );
}
