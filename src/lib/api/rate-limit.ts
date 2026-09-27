/**
 * Demo-grade in-memory sliding-window rate limiter.
 *
 * This is NOT production-grade protection: it's keyed by best-effort client
 * IP, lives in a single process's memory (resets on redeploy / restart, and
 * is per-instance in multi-instance deployments), and has no persistence.
 * It's a reasonable stopgap to blunt accidental abuse and runaway loops
 * before a real solution (e.g. Upstash/Redis, Vercel Edge Config, or a WAF)
 * is wired up.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

// Periodically drop empty/stale buckets so this doesn't grow unbounded on a
// long-lived server process.
const MAX_BUCKETS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimitOptions {
  /** Sliding window size in milliseconds. */
  windowMs: number;
  /** Max requests allowed within the window. */
  max: number;
  /** Logical bucket name so different routes don't share a counter. */
  scope: string;
}

export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function checkRateLimit(
  key: string,
  { windowMs, max, scope }: RateLimitOptions
): RateLimitResult {
  const bucketKey = `${scope}:${key}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) {
      b.hits = b.hits.filter((t) => t > windowStart);
      if (b.hits.length === 0) buckets.delete(k);
    }
  }

  let bucket = buckets.get(bucketKey);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(bucketKey, bucket);
  }

  bucket.hits = bucket.hits.filter((t) => t > windowStart);

  if (bucket.hits.length >= max) {
    const oldestHit = bucket.hits[0]!;
    const retryAfterMs = oldestHit + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  bucket.hits.push(now);
  return {
    allowed: true,
    remaining: Math.max(0, max - bucket.hits.length),
    retryAfterSeconds: 0,
  };
}

/** Convenience helper: checks the limit for a request's client IP. */
export function checkRateLimitForRequest(
  request: Request,
  options: RateLimitOptions
): RateLimitResult {
  return checkRateLimit(getClientIp(request), options);
}
