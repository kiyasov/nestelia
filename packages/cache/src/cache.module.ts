import { createCache } from "cache-manager";

import { Module } from "@kiyasov/elysia-nest";
import { CACHE_MANAGER } from "./cache.constants";
import { ConfigurableModuleClass } from "./cache.module-definition";
import { createCacheManager } from "./cache.providers";

/**
 * Empty base class that will be merged with the Cache interface. 
 *
 * This class can be used as a provider token for dependency injection.
 *
 * @publicApi
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Cache {}

/**
 * Cache interface extending the cache-manager's Cache type.
 *
 * This interface provides full typing for the cache manager instance
 * created by cache-manager library. Can be used for injection:
 * `@Inject(CACHE_MANAGER) private cacheManager: Cache`
 *
 * @publicApi
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Cache extends ReturnType<typeof createCache> {}

/**
 * Module that provides caching functionality for @kiyasov/elysia-nest.
 *
 * This module wraps the cache-manager library and provides:
 * - In-memory caching by default
 * - Support for Redis and other stores
 * - Configurable TTL and refresh thresholds
 * - CacheInterceptor for automatic HTTP caching
 *
 * @example
 * Basic usage:
 * ```typescript
 * @Module({
 *   imports: [CacheModule.register()],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * With Redis:
 * ```typescript
 * @Module({
 *   imports: [
 *     CacheModule.register({
 *       store: redisStore,
 *       ttl: 60000,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @publicApi
 */
@Module({
  providers: [
    createCacheManager(),
    {
      provide: Cache,
      useExisting: CACHE_MANAGER,
    },
  ],
  exports: [CACHE_MANAGER, Cache],
})
export class CacheModule extends ConfigurableModuleClass {}
