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

function hasInvalidControlChars(value: string): boolean {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code <= 31 || code === 127) {
      return true;
    }
  }
  return false;
}

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

  if (hasInvalidControlChars(normalized)) {
    return { ok: false, normalized, code: "INVALID_CHARACTERS" };
  }

  return { ok: true, normalized };
}
