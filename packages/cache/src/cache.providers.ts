import { type Cache as CacheManagerInstance, createCache } from "cache-manager";
import type { Cacheable } from "cacheable";
import Keyv, { type KeyvStoreAdapter } from "keyv";

import type { Provider } from "@kiyasov/elysia-nest";
import { CACHE_MANAGER } from "./cache.constants";
import { MODULE_OPTIONS_TOKEN } from "./cache.module-definition";
import { CacheManagerOptions } from "./interfaces/cache-manager.interface";

/**
 * Returns `true` when `store` is a `Cacheable` multi-tier instance
 * (identified structurally by its `primary`, `secondary`, and `nonBlocking`
 * properties).
 */
function isCacheable(store: unknown): store is Cacheable {
  return (
    typeof store === "object" &&
    store !== null &&
    "primary" in store &&
    "secondary" in store &&
    "nonBlocking" in store
  );
}

/**
 * Normalises a single store entry into the `Keyv | Cacheable` form expected
 * by `createCache`.
 *
 * - `Cacheable` instances are returned as-is (they act as store adapters).
 * - `Keyv` instances are returned as-is.
 * - Raw `KeyvStoreAdapter` implementations are wrapped in a new `Keyv`.
 */
function normaliseStore(
  store: Keyv | KeyvStoreAdapter | Cacheable,
  factoryOptions: Omit<CacheManagerOptions, "stores">,
): Keyv | Cacheable {
  if (isCacheable(store)) return store;
  if (store instanceof Keyv) return store;

  // Raw adapter — wrap it so cache-manager can use it uniformly.
  return new Keyv({
    store: store as KeyvStoreAdapter,
    ...(factoryOptions.ttl !== undefined && { ttl: factoryOptions.ttl }),
    ...(factoryOptions.namespace !== undefined && {
      namespace: factoryOptions.namespace,
    }),
  });
}

/**
 * Builds the `CACHE_MANAGER` provider that creates and configures a
 * `cache-manager` instance from the module options resolved by DI.
 *
 * Lifecycle: an `onModuleDestroy` hook is attached to the cache instance so
 * the DI container can cleanly disconnect stores on application shutdown.
 *
 * @returns A `Provider` object for use in the module's `providers` array.
 *
 * @example
 * ```typescript
 * // Used internally by CacheModule — you rarely need to call this directly.
 * const cacheManagerProvider = createCacheManager();
 * ```
 */
export function createCacheManager(): Provider {
  return {
    provide: CACHE_MANAGER,
    useFactory: async (
      options: CacheManagerOptions,
    ): Promise<CacheManagerInstance> => {
      const stores: Array<Keyv | Cacheable> | undefined = Array.isArray(
        options.stores,
      )
        ? options.stores.map((store) => normaliseStore(store, options))
        : options.stores
          ? [normaliseStore(options.stores, options)]
          : undefined;

      const cacheManager: CacheManagerInstance & {
        onModuleDestroy?: () => Promise<void>;
      } =
        stores && stores.length > 0
          ? createCache({ ...options, stores: stores as Keyv[] })
          : createCache({
              ttl: options.ttl,
              refreshThreshold: options.refreshThreshold,
              nonBlocking: options.nonBlocking,
            });

      cacheManager.onModuleDestroy = async (): Promise<void> => {
        if (!stores) return;

        await Promise.all(
          stores.map(async (store) => {
            if (
              "disconnect" in store &&
              typeof store.disconnect === "function"
            ) {
              await (store as { disconnect(): Promise<void> }).disconnect();
            }
          }),
        );
      };

      return cacheManager;
    },
    inject: [MODULE_OPTIONS_TOKEN],
  };
}
