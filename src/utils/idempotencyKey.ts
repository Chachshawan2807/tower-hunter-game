/** Stable idempotency key for a user action — survives retries. */
export function createActionIdempotencyKey(
  scope: string,
  userId: string,
  targetId: string
): string {
  return `${scope}:${userId}:${targetId}:${crypto.randomUUID()}`;
}

/** Reuse the same key when retrying the same in-flight action. */
export function createStableActionKey(
  scope: string,
  userId: string,
  targetId: string
): string {
  return `${scope}:${userId}:${targetId}`;
}
