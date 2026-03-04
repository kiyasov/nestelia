import { MODULE_OPTIONS_TOKEN } from "./cache.module-definition";

/**
 * Injection token for the CacheManager provider.
 *
 * Use this token to inject the cache manager instance:
 * `@Inject(CACHE_MANAGER) private cacheManager: Cache`
 *
 * @publicApi
 */
export const CACHE_MANAGER = "CACHE_MANAGER";

/**
 * Metadata key for cache key configuration.
 *
 * Used internally by the @CacheKey decorator to store cache key
 * configuration on method metadata.
 *
 * @internal
 */
export const CACHE_KEY_METADATA = "cache_module:cache_key";

/**
 * Metadata key for cache TTL configuration.
 *
 * Used internally by the @CacheTTL decorator to store TTL
 * configuration on method metadata.
 *
 * @internal
 */
export const CACHE_TTL_METADATA = "cache_module:cache_ttl";

/**
 * Re-export of MODULE_OPTIONS_TOKEN for convenience.
 *
 * This token provides access to the raw cache module options
 * used during module initialization.
 *
 * @publicApi
 */
export const CACHE_MODULE_OPTIONS = MODULE_OPTIONS_TOKEN;
