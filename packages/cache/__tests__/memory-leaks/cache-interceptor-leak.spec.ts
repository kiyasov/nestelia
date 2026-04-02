import { describe, expect, it } from "bun:test";

/**
 * Memory leak test: CacheInterceptor patterns.
 *
 * Issues documented:
 * 1. Cache entries without TTL grow unboundedly
 * 2. No max cache size enforcement
 * 3. Fire-and-forget promise in tap() — unhandled rejections
 *
 * These tests verify the conceptual patterns without requiring a full
 * application bootstrap.
 */
describe("Cache — memory leak patterns", () => {
  it("should demonstrate unbounded Map growth without TTL", () => {
    // Simulate an in-memory cache store (like cache-manager default)
    const cache = new Map<string, unknown>();

    // Simulate 10,000 unique URL cache keys (e.g., /users/:id)
    for (let i = 0; i < 10_000; i++) {
      const key = `/api/users/${i}`;
      cache.set(key, { id: i, name: `User ${i}`, email: `user${i}@test.com` });
    }

    // Without TTL or max-size, the cache grows indefinitely
    expect(cache.size).toBe(10_000);

    // No eviction mechanism exists
    // In production this would grow to hundreds of thousands of entries
  });

  it("should demonstrate fire-and-forget promise pattern", async () => {
    let unhandledError: unknown = null;

    // Simulate the CacheInterceptor's fire-and-forget pattern
    const cacheSet = async (key: string, value: unknown): Promise<void> => {
      throw new Error("Redis connection lost");
    };

    // This is how CacheInterceptor handles it: void promise
    // void cacheSet("key", "value");
    // The error is silently swallowed.

    // Proper pattern: catch and log
    try {
      await cacheSet("key", "value");
    } catch (err) {
      unhandledError = err;
    }

    expect(unhandledError).toBeInstanceOf(Error);
  });

  it("should demonstrate TTL-based eviction prevents unbounded growth", async () => {
    // Simulate a cache with TTL-based eviction
    const cache = new Map<string, { value: unknown; expiresAt: number }>();

    const set = (key: string, value: unknown, ttlMs: number) => {
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    };

    const get = (key: string) => {
      const entry = cache.get(key);
      if (!entry) return undefined;
      if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return undefined;
      }
      return entry.value;
    };

    // Set entries with 50ms TTL
    for (let i = 0; i < 100; i++) {
      set(`key-${i}`, `value-${i}`, 50);
    }

    expect(cache.size).toBe(100);

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Access all entries — expired ones are removed
    for (let i = 0; i < 100; i++) {
      get(`key-${i}`);
    }

    expect(cache.size).toBe(0);
  });

  it("should demonstrate max-size eviction prevents unbounded growth", () => {
    const MAX_SIZE = 100;
    const cache = new Map<string, unknown>();

    const set = (key: string, value: unknown) => {
      if (cache.size >= MAX_SIZE) {
        // Simple FIFO eviction
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) {
          cache.delete(firstKey);
        }
      }
      cache.set(key, value);
    };

    // Insert 1000 entries — only last 100 should survive
    for (let i = 0; i < 1000; i++) {
      set(`key-${i}`, `value-${i}`);
    }

    expect(cache.size).toBe(MAX_SIZE);
    // Oldest entries were evicted
    expect(cache.has("key-0")).toBe(false);
    expect(cache.has("key-999")).toBe(true);
  });
});
