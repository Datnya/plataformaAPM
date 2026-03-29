/**
 * Lightweight client-side in-memory fetch cache.
 *
 * - Returns cached data immediately if it's still within the TTL window.
 * - Falls back to a real fetch and stores the result on miss.
 * - `invalidateCache(pattern?)` lets mutations clear stale entries.
 */

interface CacheEntry {
  data: unknown;
  ts: number;
}

const store = new Map<string, CacheEntry>();

export async function fetchCached<T = unknown>(
  url: string,
  ttl = 60_000
): Promise<T> {
  const hit = store.get(url);
  if (hit && Date.now() - hit.ts < ttl) {
    return hit.data as T;
  }
  const res = await fetch(url);
  const data = await res.json();
  store.set(url, { data, ts: Date.now() });
  return data as T;
}

/** Remove entries whose key contains `pattern`. Pass nothing to clear all. */
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.includes(pattern)) store.delete(key);
  }
}
