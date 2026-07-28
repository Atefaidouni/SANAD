/**
 * Minimal in-memory rate limiter — fine for a single Node process (this app's
 * deploy target: one long-running `next start` process on shared hosting).
 * Resets on restart and isn't shared across multiple instances; if this app
 * is ever scaled horizontally, swap this for a shared store (Redis, DB table).
 */
import "server-only";

const buckets = new Map<string, number[]>();

/** Returns true if `key` has made >= `max` calls within `windowMs`. Always
 *  records the current call, so the caller should check this before acting. */
export function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);
  return hits.length > max;
}
