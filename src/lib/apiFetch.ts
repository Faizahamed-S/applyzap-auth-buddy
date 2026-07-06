/**
 * apiFetch — thin wrapper around global fetch that transparently retries
 * TRANSIENT network failures without changing any success behavior.
 *
 * Retry rules:
 *  - Up to 3 attempts total with exponential backoff (500ms, 1500ms) + jitter.
 *  - Transient = thrown network/TLS/DNS errors (fetch's TypeError), request
 *    timeouts (AbortError from our per-attempt timeout), and HTTP 502/503/504.
 *  - Normal error responses (400/401/403/404/409/422/429/other 4xx and any
 *    non-{502,503,504} 5xx) are passed through untouched — the caller still
 *    inspects response.ok exactly as before.
 *  - Mutation safety: for non-idempotent methods (POST/PUT/PATCH/DELETE) we
 *    ONLY retry on thrown connection errors where the request never reached
 *    the server. We do NOT retry a mutation that came back 502/503/504,
 *    because the server may have already processed it and retrying would risk
 *    creating duplicates.
 *  - The caller's own AbortSignal (init.signal) is honored — user-initiated
 *    aborts propagate immediately and are never retried.
 */

const RETRYABLE_STATUS = new Set([502, 503, 504]);
const MAX_ATTEMPTS = 3;
const BACKOFFS_MS = [500, 1500]; // between attempts 1→2 and 2→3
const PER_ATTEMPT_TIMEOUT_MS = 15000;

const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const jitter = (ms: number) => {
  // ±20% random jitter
  const delta = ms * 0.2;
  return Math.round(ms - delta + Math.random() * delta * 2);
};

const isAbortError = (err: unknown): boolean =>
  !!err && typeof err === "object" && (err as { name?: string }).name === "AbortError";

// fetch throws TypeError for network-layer failures (DNS, connection refused,
// TLS handshake failure, connection reset, offline, CORS network failures).
const isNetworkError = (err: unknown): boolean =>
  err instanceof TypeError;

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const isIdempotent = IDEMPOTENT_METHODS.has(method);
  const callerSignal = init.signal ?? null;

  let lastErr: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Per-attempt timeout, merged with the caller's own signal if any.
    const timeoutCtrl = new AbortController();
    const timeoutId = setTimeout(
      () => timeoutCtrl.abort(),
      PER_ATTEMPT_TIMEOUT_MS,
    );

    const onCallerAbort = () => timeoutCtrl.abort();
    if (callerSignal) {
      if (callerSignal.aborted) timeoutCtrl.abort();
      else callerSignal.addEventListener("abort", onCallerAbort, { once: true });
    }

    try {
      const res = await fetch(input, { ...init, signal: timeoutCtrl.signal });

      // Retry 502/503/504 for idempotent methods only. For mutations, pass
      // the response through so the caller doesn't accidentally double-submit.
      if (
        RETRYABLE_STATUS.has(res.status) &&
        isIdempotent &&
        attempt < MAX_ATTEMPTS
      ) {
        await sleep(jitter(BACKOFFS_MS[attempt - 1]));
        continue;
      }

      return res;
    } catch (err) {
      lastErr = err;

      // If the caller aborted, propagate immediately without retrying.
      if (callerSignal?.aborted) throw err;

      const timedOut = isAbortError(err); // per-attempt timeout fired
      const networkErr = isNetworkError(err);
      const transient = timedOut || networkErr;

      // Non-idempotent requests only retry on thrown connection/TLS errors —
      // never on timeouts alone if a server may have received the request.
      // Network errors from fetch guarantee no response was received, so
      // they're safe to retry for mutations too.
      const retryable = isIdempotent ? transient : networkErr;

      if (retryable && attempt < MAX_ATTEMPTS) {
        await sleep(jitter(BACKOFFS_MS[attempt - 1]));
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
      if (callerSignal) callerSignal.removeEventListener("abort", onCallerAbort);
    }
  }

  throw lastErr;
}
