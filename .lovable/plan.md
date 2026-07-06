# Add retry logic for transient network failures

## Problem

The app has no central fetch wrapper — every API module (`jobApi`, `userApi`, `groupsApi`, `groupJobsApi`, `analyticsApi`, plus one call in `MyGroupsHub`) calls `fetch()` directly. Transient issues (dropped connections, TLS hiccups, backend 502/503/504 during Railway cold starts or restarts) surface as immediate user-facing errors.

## Approach

Introduce one shared wrapper, `apiFetch`, and swap the raw `fetch(...)` calls in the existing API modules to use it. Behavior on success stays byte-identical to today; retries are purely additive.

## New file: `src/lib/apiFetch.ts`

A thin wrapper around `fetch` with the same signature (`(input, init) => Promise<Response>`). It contains all retry logic in one place.

Retry rules:

- **Max 3 attempts total** (1 initial + 2 retries).
- **Backoff**: 500ms, then 1500ms, each with ±20% random jitter.
- **Retry on transient failures only**:
  - Network/connection errors (fetch throws `TypeError` — DNS, connection refused, TLS handshake, connection reset).
  - Request timeouts (`AbortError` from an internal timeout signal, ~15s per attempt).
  - HTTP responses with status `502`, `503`, `504`.
- **Never retry**: `400`, `401`, `403`, `404`, `409`, `422`, `429`, any other 4xx, any 2xx/3xx, and any 5xx that isn't 502/503/504.
- **Mutation safety**: for methods other than `GET`/`HEAD`/`OPTIONS` (i.e. `POST`/`PUT`/`PATCH`/`DELETE`), only retry on a thrown connection/TLS error where no response was received. Never retry a mutation that returned a 502/503/504 — the request may have been processed server-side and retrying would risk duplicates.
- **Idempotent methods** (`GET`/`HEAD`/`OPTIONS`) may retry on both thrown network errors and 502/503/504 responses.
- Auth headers, body, endpoint, credentials, and the returned `Response` are passed through unchanged. Callers still handle `response.ok` exactly as they do today.

A short header comment in the file will explain the transient-vs-permanent split and the mutation-safety rule.

## Call-site updates (mechanical rename only)

In each of the following files, replace `fetch(` with `apiFetch(` and add `import { apiFetch } from "./apiFetch"` (or the relative equivalent). No other logic changes:

- `src/lib/jobApi.ts`
- `src/lib/userApi.ts`
- `src/lib/groupsApi.ts`
- `src/lib/groupJobsApi.ts`
- `src/lib/analyticsApi.ts`
- `src/components/groups/MyGroupsHub.tsx` (single backend call there)

## Out of scope

- No changes to Supabase auth calls (`supabase.auth.*`) — those already have their own retry/refresh.
- No changes to `referralApi.ts` (localStorage-backed mock, no network).
- No component-level changes, no toast/UX changes, no changes to `apiConfig.ts` base URL.

## Technical details

```ts
// src/lib/apiFetch.ts (shape)
const RETRYABLE_STATUS = new Set([502, 503, 504]);
const MAX_ATTEMPTS = 3;
const BACKOFFS_MS = [500, 1500]; // between attempt 1→2 and 2→3
const PER_ATTEMPT_TIMEOUT_MS = 15000;

export async function apiFetch(input, init = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const isIdempotent = method === "GET" || method === "HEAD" || method === "OPTIONS";

  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // per-attempt AbortController merged with caller's init.signal
    try {
      const res = await fetch(input, { ...init, signal: mergedSignal });
      if (RETRYABLE_STATUS.has(res.status) && isIdempotent && attempt < MAX_ATTEMPTS) {
        await sleep(jitter(BACKOFFS_MS[attempt - 1]));
        continue;
      }
      return res; // includes 4xx, non-retryable 5xx, and mutation 5xx
    } catch (err) {
      lastErr = err;
      const transient = isNetworkOrTlsError(err) || isTimeout(err);
      if (transient && attempt < MAX_ATTEMPTS) {
        await sleep(jitter(BACKOFFS_MS[attempt - 1]));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
```

The caller's own `AbortSignal` (if any) is respected — aborts propagate immediately and are not retried.
