import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  DISPLAY_NAME_MAX_LENGTH,
  validateDisplayName,
} from "../../engine/player/displayName";
import { playUiClick } from "../../hooks/useGameAudio";
import { GameIcon } from "../ui/icons";
import { t, type Locale } from "../../utils/i18n";

interface CharacterNameEditorProps {
  locale: Locale;
  displayName: string;
  busy?: boolean;
  variant?: "hud" | "stage";
  onSave: (name: string) => Promise<void>;
}

export function CharacterNameEditor({
  locale,
  displayName,
  busy = false,
  variant = "stage",
  onSave,
}: CharacterNameEditorProps) {
  const inputId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(displayName);
      setError(null);
    }
  }, [displayName, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const cancelEditing = useCallback(() => {
    setDraft(displayName);
    setError(null);
    setEditing(false);
  }, [displayName]);

  useEffect(() => {
    if (!editing) return;

    const closeOnOutside = (event: PointerEvent) => {
      if (!formRef.current?.contains(event.target as Node)) {
        cancelEditing();
      }
    };

    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [editing, cancelEditing]);

  const startEditing = useCallback(() => {
    if (busy) return;
    playUiClick();
    setDraft(displayName);
    setError(null);
    setEditing(true);
  }, [busy, displayName]);

  const submit = useCallback(async () => {
    const result = validateDisplayName(draft);
    if (!result.ok) {
      setError(t(`char.name_error.${result.code}`, locale));
      return;
    }

    if (result.normalized === displayName) {
      setEditing(false);
      return;
    }

    try {
      await onSave(result.normalized);
      setEditing(false);
      setError(null);
    } catch {
      setError(t("char.name_error.save", locale));
    }
  }, [draft, displayName, locale, onSave]);

  if (editing) {
    return (
      <form
        ref={formRef}
        className={`name-editor name-editor--editing name-editor--${variant}`}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label className="sr-only" htmlFor={inputId}>
          {t("char.name_label", locale)}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          className="name-editor__input"
          type="text"
          value={draft}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          onChange={(event) => {
            setDraft(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              cancelEditing();
            }
          }}
        />
        {variant === "stage" ? (
          <div className="name-editor__actions">
            <button
              type="button"
              className="name-editor__btn name-editor__btn--ghost"
              disabled={busy}
              onClick={cancelEditing}
            >
              {t("char.name_cancel", locale)}
            </button>
            <button
              type="submit"
              className="name-editor__btn name-editor__btn--save"
              disabled={busy}
            >
              {busy ? t("char.name_saving", locale) : t("char.name_save", locale)}
            </button>
          </div>
        ) : null}
        {error ? (
          <p id={`${inputId}-error`} className="name-editor__error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <button
      type="button"
      className={[
        "name-editor",
        variant === "hud" ? "hud-name--inline name-editor--hud" : "name-editor--stage",
      ].join(" ")}
      onClick={startEditing}
      disabled={busy}
      aria-label={t("char.name_edit", locale)}
    >
      <span className="name-editor__label">{displayName}</span>
      {variant === "stage" ? (
        <span className="name-editor__icon" aria-hidden="true">
          <GameIcon name="settings" size={18} />
        </span>
      ) : null}
    </button>
  );
}
