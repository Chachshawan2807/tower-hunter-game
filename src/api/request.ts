const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface ApiRequestOptions extends RequestInit {
  /** Skip retry for non-idempotent reads when false (default true for GET). */
  retry?: boolean;
  maxRetries?: number;
}

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const inFlightGetRequests = new Map<string, Promise<unknown>>();

function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (err.name === "TypeError") return true;
  return /network|fetch|failed to fetch/i.test(err.message);
}

function backoffMs(attempt: number): number {
  const base = Math.min(10_000, 1_000 * 2 ** attempt);
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  path: string,
  init?: ApiRequestOptions
): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const shouldRetry = init?.retry ?? method === "GET";
  const maxRetries = init?.maxRetries ?? (method === "GET" ? 1 : 3);

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...init?.headers,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const error = new Error(
          (body as { error?: string }).error ?? `Request failed: ${response.status}`
        );
        (error as Error & { status?: number }).status = response.status;

        if (
          shouldRetry &&
          attempt < maxRetries &&
          RETRYABLE_STATUS.has(response.status)
        ) {
          await sleep(backoffMs(attempt));
          continue;
        }

        throw error;
      }

      return response.json() as Promise<T>;
    } catch (err) {
      lastError = err;

      if (shouldRetry && attempt < maxRetries && isRetryableError(err)) {
        await sleep(backoffMs(attempt));
        continue;
      }

      throw err;
    }
  }

  throw lastError ?? new Error("Request failed");
}

export async function apiRequest<T>(
  path: string,
  init?: ApiRequestOptions
): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  if (method !== "GET") {
    return fetchWithRetry<T>(path, init);
  }

  const existing = inFlightGetRequests.get(path);
  if (existing) {
    return existing as Promise<T>;
  }

  const request = fetchWithRetry<T>(path, init).finally(() => {
    inFlightGetRequests.delete(path);
  });

  inFlightGetRequests.set(path, request);
  return request;
}
