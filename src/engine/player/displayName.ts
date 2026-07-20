export const DISPLAY_NAME_MIN_LENGTH = 1;
export const DISPLAY_NAME_MAX_LENGTH = 20;

export type DisplayNameValidationCode =
  | "EMPTY"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "INVALID_CHARACTERS";

export interface DisplayNameValidationResult {
  ok: boolean;
  normalized: string;
  code?: DisplayNameValidationCode;
}

const INVALID_CHAR_PATTERN = /[\x00-\x1f\x7f]/;

export function normalizeDisplayName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function validateDisplayName(raw: string): DisplayNameValidationResult {
  const normalized = normalizeDisplayName(raw);

  if (!normalized) {
    return { ok: false, normalized, code: "EMPTY" };
  }

  if (normalized.length < DISPLAY_NAME_MIN_LENGTH) {
    return { ok: false, normalized, code: "TOO_SHORT" };
  }

  if (normalized.length > DISPLAY_NAME_MAX_LENGTH) {
    return { ok: false, normalized, code: "TOO_LONG" };
  }

  if (INVALID_CHAR_PATTERN.test(normalized)) {
    return { ok: false, normalized, code: "INVALID_CHARACTERS" };
  }

  return { ok: true, normalized };
}
