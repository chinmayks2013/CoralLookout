/** Supabase fetch with a hard timeout so auth retries don't block for 30s+. */
export function supabaseFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const timeoutMs = 5_000;
  const signal =
    init?.signal ??
    (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
      ? AbortSignal.timeout(timeoutMs)
      : undefined);

  return fetch(input, { ...init, signal });
}
