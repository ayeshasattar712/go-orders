/**
 * In-memory sliding-window rate limiter.
 * Replace with Redis / Upstash in multi-instance production deployments.
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(
  key: string,
  limit = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100),
  windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const entry = store.get(key) ?? { timestamps: [] };

  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (entry.timestamps.length >= limit) {
    store.set(key, entry);
    const oldest = entry.timestamps[0] ?? now;
    return {
      success: false,
      remaining: 0,
      resetAt: oldest + windowMs,
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    success: true,
    remaining: Math.max(limit - entry.timestamps.length, 0),
    resetAt: now + windowMs,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
